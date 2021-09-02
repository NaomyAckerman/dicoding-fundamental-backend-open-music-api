require('dotenv').config();
const amqp = require('amqplib');

class ConsumerService {
  constructor(playlistsService, mailSender) {
    this._playlistsService = playlistsService;
    this._mailSender = mailSender;
    this.listen = this.listen.bind(this);
    this.consumeMessage = this.consumeMessage.bind(this);
  }

  async listen(message) {
    const { playlistId, targetEmail } = JSON.parse(message.content.toString());
    const songs = await this._playlistsService.getSongsFromPlaylist(playlistId);
    await this._mailSender.sendEmail(targetEmail, JSON.stringify(songs));
  }

  async consumeMessage(queue) {
    const connection = await amqp.connect(process.env.RABBITMQ_SERVER);
    const channel = await connection.createChannel();
    await channel.assertQueue(queue, {
      durable: true,
    });
    channel.consume(queue, this.listen, { noAck: true });
  }
}

module.exports = ConsumerService;
