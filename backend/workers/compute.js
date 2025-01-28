const { workerData, parentPort } = require('worker_threads');

// Example of a computationally intensive task
function heavyComputation(data) {
  // Simulate complex calculation
  let result = 0;
  for (let i = 0; i < 1000000; i++) {
    result += Math.sqrt(i);
  }
  return {
    input: data,
    result: result,
    computedAt: new Date()
  };
}

// Process the data
const result = heavyComputation(workerData);

// Send the result back to the main thread
parentPort.postMessage(result);
