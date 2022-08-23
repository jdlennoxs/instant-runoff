const { getResultsData } = require("./read-csv");
const { writeCsv } = require("./write-csv");

const cleanResults = (total, results, columnNames = [], first) => {
  return results.map((result) => {
    Object.keys(result).forEach((candidate) => {
      if (columnNames.includes(candidate)) {
        delete result[candidate];
      }
      if (Number.isNaN(parseInt(result[candidate]))) {
        if (first) {
          result[candidate] = total;
        }
      }
    });
    return result;
  });
};

const calculateRunoffWinner = async (filename) => {
  const { headers, results } = await getResultsData(filename);
  const majority = Math.floor(results.length / 2) + 1;
  const totalCandidates = headers.length;
  let hasMajority = false;
  let hasPrinted = false;
  let iteration = 0;
  let winner;
  let cleaned = cleanResults(totalCandidates, results, [], true);
  const totalScore = [];

  while (!hasMajority) {
    const scores = {};
    cleaned.forEach((voter) => {
      const topCandidate = Object.keys(voter).reduce((a, b) =>
        voter[a] < voter[b] ? a : b
      );
      if (scores[topCandidate]) {
        scores[topCandidate] += 1;
      } else {
        scores[topCandidate] = 1;
      }
    });
    if (iteration === 0) {
      headers.forEach((header) => {
        if (!Object.keys(scores).includes(header)) {
          scores[header] = 0;
        }
      });
    }
    // Print a short list of candidates
    if (
      !hasPrinted &&
      Object.keys(scores).length >= 3 &&
      Object.keys(scores).length <= 5
    ) {
      hasPrinted = true;
      console.log("Short list", Object.keys(scores));
    }
    totalScore.push(scores);
    const leader = Object.keys(scores).reduce((a, b) =>
      scores[a] > scores[b] ? a : b
    );
    if (scores[leader] >= majority) {
      hasMajority = true;
      winner = leader;
      totalScore.push({ [leader]: "WINNER" });
    }
    // else remove bottom candidate(s)
    const lowestScore = Object.values(scores).reduce((a, b) => (a < b ? a : b));
    let losingCandidates = Object.keys(scores).filter(
      (a) => scores[a] === lowestScore
    );
    // With low volumes of votes some candidates result in the same scores
    // In this case tally the original vote totals to decide the winner
    if (!winner && losingCandidates.length > 1) {
      console.log("Draw, evaluating tie breaker");
      const tieBreaker = {};
      cleaned.forEach((voter) => {
        Object.keys(voter).forEach((candidate) => {
          if (tieBreaker[candidate]) {
            tieBreaker[candidate] += parseInt(voter[candidate]);
          } else {
            tieBreaker[candidate] = parseInt(voter[candidate]);
          }
        });
      });
      const highestScore = Object.values(tieBreaker).reduce((a, b) =>
        a > b ? a : b
      );
      losingCandidates = Object.keys(tieBreaker).filter(
        (a) => tieBreaker[a] === highestScore
      );
    }
    removed += losingCandidates.length;
    cleaned = cleanResults(totalCandidates, results, losingCandidates);
    iteration += 1;
  }
  writeCsv(filename, headers, totalScore);
};

calculateRunoffWinner("simple.csv");
