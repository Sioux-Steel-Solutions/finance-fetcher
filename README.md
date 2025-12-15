## Finance Fetcher

## API Usage

The historical data can be accessed from this endpoint with commodity indicators being passed in as query parameters.

```HTTP
https://api.tradingeconomics.com/markets/historical/S%201:COM?d1=2025-12-08&d2=2025-12-15
```

The plan for now is to have the scheduler run each week day at 6pm, instead of doing weekly updates.

In the future, if weekly updates are needed refer back to this example.

## Grab All Indiciators for Commodities

You can find all indicators by visiting the aggregated market pull.

_Example:_

```HTTP
https://api.tradingeconomics.com/markets/commodities
```
