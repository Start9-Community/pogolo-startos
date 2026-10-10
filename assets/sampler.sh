#!/bin/sh
# Records pogolo's total hashrate once a minute for the dashboard graph.
# pogolo keeps no history itself; this file is what the graph reads.

OUT=/data/hashrate.csv
KEEP=10080 # 7 days of 1-minute samples

trap 'exit 0' TERM INT

while true; do
	hr=$(wget -qO- -T 5 http://127.0.0.1:5662/api/v1/info 2>/dev/null |
		sed -n 's/.*"totalHashrate":\([0-9.eE+-]*\).*/\1/p')
	if [ -n "$hr" ]; then
		echo "$(date +%s),$hr" >>"$OUT"
		tail -n "$KEEP" "$OUT" >"$OUT.tmp" && mv "$OUT.tmp" "$OUT"
	fi
	sleep 60 &
	wait $!
done
