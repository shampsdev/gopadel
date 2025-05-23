package main

import (
	"bufio"
	"fmt"
	"os"
)

type node struct {
	length     int
	suffixLink int
	next       [26]int
}

func main() {
	reader := bufio.NewReader(os.Stdin)
	writer := bufio.NewWriter(os.Stdout)
	defer writer.Flush()

	var s string
	fmt.Fscan(reader, &s)
	n := len(s)
	runes := []rune(s)

	
	nodes := make([]node, n+3)

	
	
	nodes[1].length = 0
	nodes[1].suffixLink = 2
	
	nodes[2].length = -1
	nodes[2].suffixLink = 2

	curSuffix := 1  
	nodeCount := 2  
	uniqCount := 0  

	for i := 0; i < n; i++ {
		c := runes[i] - 'a'
		cur := curSuffix

		
		
		for {
			if i-1-nodes[cur].length >= 0 && runes[i-1-nodes[cur].length] == runes[i] {
				break
			}
			cur = nodes[cur].suffixLink
		}

		
		if nodes[cur].next[c] == 0 {
			nodeCount++
			nodes[nodeCount].length = nodes[cur].length + 2

			
			if nodes[nodeCount].length == 1 {
				nodes[nodeCount].suffixLink = 1
			} else {
				
				suf := nodes[cur].suffixLink
				for {
					if i-1-nodes[suf].length >= 0 && runes[i-1-nodes[suf].length] == runes[i] {
						break
					}
					suf = nodes[suf].suffixLink
				}
				nodes[nodeCount].suffixLink = nodes[suf].next[c]
			}

			nodes[cur].next[c] = nodeCount
			uniqCount++
		}

		
		curSuffix = nodes[cur].next[c]

		
		fmt.Fprintln(writer, uniqCount)
	}
}
