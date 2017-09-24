// let platform = require('platform');
let math = require('mathjs');
math.config({number:'BigNumber', precision: 256});
let primes = require('./primes.json');
let n = 4;
if (process.argv.length > 2) {
	n = parseInt(process.argv[2]);
}
let edges = (n * (n - 1)) / 2;
let config = {
	n,
	edges,
	targetEnergy: math.format(calcEnergy(n, edges)),
	primes: primes.slice(0, edges),
}

let pointNames = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','A','B'];

let graph = buildGraph(config);
scoreGraph(graph);
console.log(graph.sum + ' ' + graph.score + ' ' + logGraph(graph));
let best = graph.score;
while (true) {
	mutateGraph(graph);
	scoreGraph(graph);
	if (graph.score < best) {
		console.log(graph.sum + ' ' + graph.score + ' ' + logGraph(graph));
		best = graph.score;
	}
}
// console.log(graph.points[0]);

function calcEnergy(n, edges) {
	let sum = math.bignumber(1);
	for (var i = 0; i < edges; i++) {
		sum = math.multiply(sum, math.bignumber(primes[i]));
	}
	return math.ceil(math.multiply(math.pow(sum, math.bignumber(2/n)), n));
	//Math.ceil(n * Math.pow(sum, 2 / n));
}

function buildGraph(config) {
	let points = [];
	let edges = [];
	for (let i = 0; i < config.n; i++) {
		points.push({
			i,
			name: pointNames[i],
			edges: [],
		});
	}

	let k = 0;

	for (let i = 0; i < config.n; i++) {

		let pointa = points[i];
		for (let j = i+1; j < config.n; j++) {
			let pointb = points[j];
			let edge = {
				i: k,
				name: pointa.name + '-' + pointb.name,
				value: config.primes[k],
			};
			k++;
			edges.push(edge);
			pointa.edges.push(edge);
			pointb.edges.push(edge);
		}

	}

	return {
		points,
		edges,
		targetEnergy: config.targetEnergy,
	};
}

function scoreGraph(graph) {
	let sum = 0;
	let plength = graph.points.length;
	let elength = plength - 1;
	for (let i = 0; i < plength; i++) {
		let point = graph.points[i];
		point.score = 1;
		let edges = point.edges;
		for (let j = 0; j < elength; j++) {
			point.score *= edges[j].value;
		}
		sum += point.score;
	}
	graph.sum = sum;
	graph.score = sum - graph.targetEnergy;
	return sum;
}

function sortGraph(graph) {
	let plength = graph.points.length;
	for (let i = 0; i < plength; i++) {
		let point = graph.points[i];
		point.edges.sort((a,b) => a.value - b.value);
	}
	graph.points.sort((a,b) => a.edges[0].value - b.edges[0].value);
}

function logGraph(graph) {
	let plength = graph.points.length;
	sortGraph(graph);
	let results = [];
	for (let i = 0; i < plength; i++) {
		let point = graph.points[i];
		// point.score = 1;
		results.push('{' +
			point.edges.map(e=>e.value).join(',') +
			'}');
	}
	return results.join(',');
}

function mutateGraph(graph) {
	// sort by point score
	// graph.points.sort((a,b) => a.score - b.score);
	let n = graph.points.length;
	let first = graph.points[random(n)];
	let last = graph.points[random(n, first.i)];
	let a = first.edges[random(n-1)];
	let b = last.edges[random(n-1)];
	let tmp = a.value;
	a.value = b.value;
	b.value = tmp;

}

function random(n, except) {
	if (except == undefined) {
		return Math.floor(Math.random() * n);
	} else {
		while(true) {
			let chance = Math.floor(Math.random() * n);
			if (chance != except) {
				return chance;
			}
		}
	}
}