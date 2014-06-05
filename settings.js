module.exports = {
    db: 'mongodb://localhost:27017/wedate',
    rabbitmq:'localhost',
    rabbitmqPort:5672,
    rabbitmqUser:'guest',
    rabbitmqPassword:'guest',
    queue: 'APNS',
    exchange: 'router',
    routingKey: 'A'
};
