import { useState, useEffect } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import Axios from 'axios';
import './App.css';

function App() {

	const [isError, setIsError] = useState(false);

	const {
		data,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isLoading,
	} = useInfiniteQuery({
		queryKey: ["coins"],
		queryFn: async({ pageParam = 1}) => {
			try {
				const response = await Axios.get(
					`https://api.coingecko.com/api/v3/coins/markets`, {
						params: {
							vs_currency: 'usd',
							per_page: 20,
							page: pageParam,
							price_change_percentage: '24h'
						},
						headers: {
							'x-cg-demo-api-key': import.meta.env.VITE_REACT_APP_API_KEY
						}
					}
				);
				return response.data;
			} catch(error) {
				setIsError(true);
				throw error;
			};
		},
		getNextPageParam: (lastPage, allPages) => {
			return lastPage.length === 20 ? allPages.length + 1 : null;
		},
		enabled: !isError,
	});

	const [lastCoinRef, inView] = useInView();
	useEffect(() => {
		if(inView && hasNextPage && !isFetchingNextPage) {
			fetchNextPage();
		};
	}, [fetchNextPage, inView, hasNextPage, isFetchingNextPage]);

	
	if(isLoading) {return <>Loading...</>};
	if(isError) {return <>Fetching Error (Refresh Shortly After)</>};

	return(
		<>
			<span className="version">Alex Nguyen v1.0.0</span>
 			<header className="web-header">Cryptocurrency Tracker</header>

			<div className="table-coins-wrapper">
				<table className="table-coins">
					<thead>
						<tr className="table-headers">
							<th>#</th>
							<th>Name</th>
							<th>Price</th>
							<th>24h</th>
							<th className="hide-mobile">Volume</th>
							<th className="hide-mobile">Market Cap</th>
						</tr>
						<tr></tr>
					</thead>
					<tbody>
						{
						data?.pages.flatMap((page) => 
							page.map((coin) => {
								let sign = "";
								let classColor = "negative-change";
								if(coin.price_change_percentage_24h >= 0) {
									sign = "+";
									classColor = "positive-change";
								}
								return(
									<tr className="coin-row" key={coin.market_cap_rank}>
										<td className="coin-info">{coin.market_cap_rank}</td>
										<td className="coin-info coin-image-name">
											{<img className="coin-image" src={coin.image}></img>}
											{coin.symbol.toUpperCase()}
										</td>
										<td className="coin-info">$ {coin.current_price.toLocaleString('en-US')}</td>
										<td className={"coin-info"}>
											<div className={`${classColor}`}>
												{sign}{coin.price_change_percentage_24h.toFixed(2)}%
											</div>
										</td>
										<td className="coin-info hide-mobile">$ {coin.total_volume.toLocaleString('en-US')}</td>
										<td className="coin-info hide-mobile">$ {coin.market_cap.toLocaleString('en-US')}</td>
									</tr>
								);
							})
						)
						}
						<div ref={lastCoinRef}></div>
					</tbody>
				</table>
			</div>

			{isFetchingNextPage ? <div class="loader"></div> : null}
		</>
	);
}

export default App;
