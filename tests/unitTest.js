const { coreLogic } = require('../coreLogic');
const task = require('../task');
const index = require('../index');

async function test_coreLogic() {
  const round = 1;
  await coreLogic.task(round);
  const submission = await coreLogic.submitTask(round);
  console.log('Получено тестовое представление', submission);
  const audit = await task.audit.validateNode(submission, round);

  const _dummyTaskState = {
    stake_list: {
      '2NstaKU4kif7uytmS2PQi9P5M5bDLYSF2dhUNFhJbxHL': 20000000000,
      '2NstaKU4kif7uytmS2PQi9P5M5bDLYSF2dhUNFhJbxHH': 10000000000,
    },
    bounty_amount_per_round: 1000000000,

    submissions: {
      1: {
        '2NstaKU4kif7uytmS2PQi9P5M5bDLYSF2dhUNFhJbxHL': {
          submission_value: '8164bb07ee54172a184bf35f267bc3f0052a90cd',
          slot: 1889700,
          round: 1,
        },
        '2NstaKU4kif7uytmS2PQi9P5M5bDLYSF2dhUNFhJbxHH': {
          submission_value: '8164bb07ee54172a184bf35f267bc3f0052a90cc',
          slot: 1890002,
          round: 1,
        },
      },
    },
    submissions_audit_trigger: {
      1: {
        // Номер раунда
        '2NstaKU4kif7uytmS2PQi9P5M5bDLYSF2dhUNFhJbxHL': {
          // Отправитель данных (отправить данные в K2)
          trigger_by: '2NstaKU4kif7uytmS2PQi9P5M5bDLYSF2dhUNFhJbxHH', // Аудит триггер
          slot: 1890002,
          votes: [
            {
              is_valid: false, // Представление недействительно (Слэш)
              voter: '2NstaKU4kif7uytmS2PQi9P5M5bDLYSF2dhUNFhJbxHZ', // Голосующий
              slot: 1890003,
            },
          ],
        },
        '2NstaKU4kif7uytmS2PQi9P5M5bDLYSF2dhUNFhJbxHH': {
          // Отправитель данных (отправить данные в K2)
          trigger_by: '2NstaKU4kif7uytmS2PQi9P5M5bDLYSF2dhUNFhJbxHL', // Аудит триггер
          slot: 1890002,
          votes: [
            {
              is_valid: true, // Представление действительно
              voter: '2NstaKU4kif7uytmS2PQi9P5M5bDLYSF2dhUNFhJbxHZ', // Голосующий
              slot: 1890003,
            },
          ],
        },
      },
    },
  };

  if (audit === true) {
    console.log('Представление действительно, генерируем список распределения');
    await task.distribution.submitDistributionList(round);
    await task.distribution.auditDistribution(round);
  } else {
    console.log('Представление недействительно, список распределения не генерируется');
  }
}

test_coreLogic();
