const { namespaceWrapper } = require('../_koiiNode/koiiNode');
const axios = require('axios');
const Speaker = require('speaker');
const { PassThrough } = require('stream');
const fs = require('fs');

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
      await this.playAudioFromPlaylist('https://catchtherecord.com/files/1281531/reverie-field.pls');

      // Store the result in NeDB (optional)
      const value = 'Audio played';
      if (value) {
        await namespaceWrapper.storeSet('value', value);
      }

      // Optional, return your task
      return value;
    } catch (err) {
      console.log('ERROR IN EXECUTING TASK', err);
      return 'ERROR IN EXECUTING TASK' + err;
    }
  }

  /**
   * Plays audio from a playlist file (.pls or .m3u).
   *
   * @param {string} playlistURL - URL of the playlist file
   */
  async playAudioFromPlaylist(playlistURL) {
    console.log('Playing audio from playlist...');
    
    const playlistContent = await this.downloadPlaylistContent(playlistURL);
    const audioURL = this.extractAudioURLFromPlaylist(playlistContent);
    
    if (!audioURL) {
      throw new Error('No audio URL found in the playlist.');
    }

    await this.playAudioFromURL(audioURL);
  }

  /**
   * Downloads the content of a playlist file.
   *
   * @param {string} playlistURL - URL of the playlist file
   * @returns {string} Content of the playlist file
   */
  async downloadPlaylistContent(playlistURL) {
    const response = await axios.get(playlistURL);
    return response.data;
  }

  /**
   * Extracts the audio URL from the content of a playlist file.
   *
   * @param {string} playlistContent - Content of the playlist file
   * @returns {string|null} URL of the audio stream, or null if not found
   */
  extractAudioURLFromPlaylist(playlistContent) {
    const urlRegex = /(http|https):\/\/[^ "]+/g;
    const matches = playlistContent.match(urlRegex);
    return matches ? matches[0] : null;
  }

  /**
   * Plays audio from a given URL.
   *
   * @param {string} audioURL - URL of the audio stream
   */
  async playAudioFromURL(audioURL) {
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
   * Submits a task for a given round
   *
   * @param {number} round - The current round number
   * @returns {Promise<any>} The submission value that you will use in audit. Ex. cid of the IPFS file
   */
  async submitTask(round) {
    console.log('SUBMIT TASK CALLED ROUND NUMBER', round);
    try {
      console.log('SUBMIT TASK SLOT', await namespaceWrapper.getSlot());
      const submission = await this.fetchSubmission(round);
      console.log('SUBMISSION', submission);
      await namespaceWrapper.checkSubmissionAndUpdateRound(
        submission,
        round
      );
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
   * @returns {Promise<string>} The submission value that you will use in audit. It can be the real value, cid, etc.
   */
  async fetchSubmission(round) {
    console.log('FETCH SUBMISSION');
    // Fetch the value from NeDB
    const value = await namespaceWrapper.storeGet('value'); // retrieves the value
    // Return cid/value, etc.
    return value;
  }
}

const submission = new Submission();
module.exports = { submission };
