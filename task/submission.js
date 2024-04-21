const { namespaceWrapper } = require('../_koiiNode/koiiNode');
const axios = require('axios');
const Speaker = require('speaker');
const { PassThrough } = require('stream');

class Submission {
  /**
   * Executes your task, optionally storing the result.
   *
   * @param {number} round - The current round number
   * @returns {void}
   */
  async task(round) {
    try {
      console.log('ROUND', round);

      // Play audio
      await this.playAudioFromURL('https://a1.asurahosting.com:10060/radio.mp3');

      // Store the result in NeDB (optional)
      const value = 'Audio played';
      await this.storeValue(value);

      // Return your task
      return value;
    } catch (err) {
      console.log('ERROR IN EXECUTING TASK', err);
      return 'ERROR IN EXECUTING TASK' + err;
    }
  }

  /**
   * Plays audio from a given URL.
   *
   * @param {string} audioURL - URL of the audio stream
   */
  async playAudioFromURL(audioURL) {
    console.log('Playing audio from URL:', audioURL);
    const response = await axios.get(audioURL, { responseType: 'stream' });
    const speaker = new Speaker();
    const passThrough = new PassThrough();
    
    // Pipe the audio stream to the speaker
    response.data.pipe(passThrough).pipe(speaker);

    // Handle errors
    speaker.on('error', (err) => {
      console.error('Speaker error:', err);
    });

    // Wait until the stream ends
    await new Promise((resolve, reject) => {
      passThrough.on('end', resolve);
      passThrough.on('error', reject);
    });
  }

  /**
   * Stores a value in NeDB.
   *
   * @param {string} value - The value to store
   */
  async storeValue(value) {
    try {
      // Store the value in NeDB
      console.log('Storing value:', value);
      // Assuming namespaceWrapper has a method storeSet for storing values
      await namespaceWrapper.storeSet('value', value);
    } catch (error) {
      console.error('Error storing value:', error);
    }
  }

  /**
   * Submits a task for a given round
   *
   * @param {number} round - The current round number
   * @returns {Promise<any>} The submission value that you will use in audit.
   */
  async submitTask(round) {
    console.log('SUBMIT TASK CALLED ROUND NUMBER', round);
    try {
      console.log('SUBMIT TASK SLOT', await namespaceWrapper.getSlot());
      const submission = await this.fetchSubmission(round);
      console.log('SUBMISSION', submission);
      await this.checkAndUpdateSubmission(submission, round);
      console.log('SUBMISSION CHECKED AND ROUND UPDATED');
      return submission;
    } catch (error) {
      console.log('ERROR IN SUBMISSION', error);
    }
  }

  /**
   * Fetches the submission value
   *
   * @param {number} round - The current round number
   * @returns {Promise<string>} The submission value
   */
  async fetchSubmission(round) {
    console.log('FETCH SUBMISSION');
    try {
      // Fetch the value from NeDB
      const value = await namespaceWrapper.storeGet('value');
      console.log('Fetched value:', value);
      return value;
    } catch (error) {
      console.error('Error fetching submission:', error);
      return null;
    }
  }

  /**
   * Checks and updates the submission.
   *
   * @param {string} submission - The submission value
   * @param {number} round - The current round number
   */
  async checkAndUpdateSubmission(submission, round) {
    // Assuming namespaceWrapper has a method checkSubmissionAndUpdateRound for updating submissions
    await namespaceWrapper.checkSubmissionAndUpdateRound(submission, round);
  }
}

const submission = new Submission();
module.exports = { submission };
