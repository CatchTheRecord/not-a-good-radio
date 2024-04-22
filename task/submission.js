const axios = require('axios');
const { namespaceWrapper } = require('../_koiiNode/koiiNode');
const Speaker = require('speaker');

class Submission {
  /**
   * Выполняет ваше задание, при необходимости сохраняя результат.
   *
   * @param {number} round - Текущий номер раунда
   * @returns {Promise<string>} - Результат выполнения задания
   */
  async task(round) {
    try {
      console.log('ROUND', round);

      // Воспроизведение аудио из предоставленного URL
      await this.playAudioFromURL('https://catchtherecord.com/track/2972143/07-gurba-prosti');

      // Сохранение результата в NeDB (по желанию)
      const value = 'Audio played';
      await this.storeValue(value);

      // Возврат вашего задания
      return value;
    } catch (error) {
      console.error('Ошибка при выполнении задания:', error.message);
      throw new Error('Ошибка при выполнении задания: ' + error.message);
    }
  }

  /**
   * Воспроизводит аудио из указанного URL.
   *
   * @param {string} audioURL - URL аудиопотока
   */
  async playAudioFromURL(audioURL) {
    console.log('Воспроизведение аудио из URL:', audioURL);
    try {
      const response = await axios.get(audioURL, { responseType: 'stream' });
      const speaker = new Speaker({
        channels: 2,          // Количество аудиоканалов (2 для стерео)
        bitDepth: 16,         // Количество бит на выборку (16 для CD-качества)
        sampleRate: 48000    // Частота дискретизации (44100 Гц для CD-качества)
      });
      response.data.pipe(speaker);

      // Обработка ошибок
      speaker.on('error', (err) => {
        console.error('Ошибка воспроизведения:', err.message);
      });

      // Ожидание окончания потока
      await new Promise((resolve, reject) => {
        speaker.on('finish', () => {
          console.log('Audio played');
          speaker.end(); // Закрыть поток Speaker
          resolve(); // Разрешить промис после окончания воспроизведения
        });
        speaker.on('error', reject);
      });
    } catch (error) {
      console.error('Ошибка воспроизведения аудио из URL:', error.message);
      throw new Error('Ошибка воспроизведения аудио из URL: ' + error.message);
    }
  }

  /**
   * Сохраняет значение в NeDB.
   *
   * @param {string} value - Значение для сохранения
   */
  async storeValue(value) {
    try {
      // Сохранение значения в NeDB
      console.log('Сохранение значения:', value);
      await namespaceWrapper.storeSet('value', value);
    } catch (error) {
      console.error('Ошибка сохранения значения:', error.message);
      throw new Error('Ошибка сохранения значения: ' + error.message);
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
      console.error('ERROR IN SUBMISSION:', error.message);
      throw new Error('Ошибка при отправке задания: ' + error.message);
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
      console.error('Error fetching submission:', error.message);
      throw new Error('Ошибка при получении значения: ' + error.message);
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
    try {
      await namespaceWrapper.checkSubmissionAndUpdateRound(submission, round);
    } catch (error) {
      console.error('Error checking and updating submission:', error.message);
      throw new Error('Ошибка при проверке и обновлении значения: ' + error.message);
    }
  }
}

const submission = new Submission();
module.exports = { submission };
