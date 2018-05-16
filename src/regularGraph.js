function genPrimes(n) {
    function isPrime(num) {
        if ( num === 0 || num === 1 ) {
            return false;
        }
        for (var i = 2; i < num; i++) {
            if ( num % i === 0 ) {
                return false;
            }
        }
        return true;
    }

    var primes = [2];
    var i = 3;
    while (primes.length < n) {
        if (isPrime(i)) {
            primes.push(i);
        }
        i++;
    }
    return primes;
}

function genNodes(options, width, height, n) {
    var nodes = new vis.DataSet(options);

    for (var y = 0; y < n; y++) {
        for (var x = 0; x < n; x++) {
            var pos = y * n + x;
            nodes.add({
                id: pos,
                title: pos,
                x: x,
                y: y,
                origin: {
                    x: x,
                    y: y,
                    title: pos
                },
                chosen: {
                    node: changeChosenNode
                }
            });
        }
    }

    return nodes;
}

function genEdges(options, n) {
    var edges = new vis.DataSet(options);
    var primes = genPrimes(n*n);
    function genEdge(id, from, to) {
        return {
            id: id,
            from: pos,
            to: to,
            chosen: {
                edge: changeChosenEdge
            }
        }
    }

    for (var y = 0; y < n; y++) {
        for (var x = 0; x < n; x++) {
            var pos = y * n + x;
            var p = primes[pos];

            if (pos > n)          edges.add(genEdge(p            , pos, pos - n));
            if (pos % n != n - 1) edges.add(genEdge(p * p        , pos, pos + 1));
            if (pos < n * n - n)  edges.add(genEdge(p * p * p    , pos, pos + n));
            if (pos % n != 0)     edges.add(genEdge(p * p * p * p, pos, pos - 1));
        }
    }

    return edges;
}

function createRegular(width, height, n) {
    var options = {};
    var nodes = genNodes(options, width, height, n);
    var edges = genEdges(options, n);

    return {
        nodes: nodes,
        edges: edges
    };
}
