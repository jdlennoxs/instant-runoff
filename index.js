const {getResultsData} = require('./read-csv')
const { writeCsv } = require('./write-csv')

const cleanResults = (results, columnNames = []) => {
    console.log(columnNames)
    return results.map(result => {
        Object.keys(result).forEach(candidate => {
            if(columnNames.includes(candidate)) {
                delete result[candidate]
            }
            if(Number.isNaN(parseInt(result[candidate]))) {
                delete result[candidate]
            }
        })
        return result
    })
}

const calculateRunoffWinner = async (filename) => {
    const {headers, results} = await getResultsData(filename)
    const majority = (Math.floor(results.length / 2)) + 1
    let hasMajority = false
    let hasPrinted = false
    let iteration = 0
    let winner
    let cleaned = cleanResults(results)
    const totalScore = []

    while (!hasMajority) {
    const scores = {}
    cleaned.forEach(voter => {
        const topCandidate = Object.keys(voter).reduce((a,b)=>voter[a]<voter[b]?a:b)
        if(scores[topCandidate]) {
            scores[topCandidate] += 1
        } else {
            scores[topCandidate] = 1
        }
    })
    if(iteration === 0) {
    headers.forEach(header => {
        if(!Object.keys(scores).includes(header)) {
            scores[header] = 0
        }
    })
}
    if(!hasPrinted && Object.keys(scores).length >= 3 && Object.keys(scores).length <= 5){
        hasPrinted = true
        console.log('Short list', Object.keys(scores))
    }
    totalScore.push(scores)
    const leader = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
    if(scores[leader] >= majority) {
        hasMajority = true
        winner = leader
        totalScore.push({[leader]: 'WINNER'})
    }
    // else remove bottom candidate(s)
    const lowestScore = Object.values(scores).reduce((a, b) => a < b ? a : b);
    const losingCandidates = Object.keys(scores).filter((a) => scores[a] === lowestScore)
    if(!winner && losingCandidates.length === Object.keys(results[0]).length) {
        console.log("Draw")
        const draw = losingCandidates.reduce((acc, candidate) => ({...acc, [candidate]: "DRAW"}), {})
        totalScore.push(draw)
        hasMajority = true
    }
    cleaned = cleanResults(results, losingCandidates)
    iteration += 1
    }
    writeCsv(headers, totalScore)
}

calculateRunoffWinner('test.csv')