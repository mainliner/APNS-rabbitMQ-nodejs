###Apple推送服务
-------
使用nodejs实现的iOS客户端推送服务器，后台数据库结构未公开。

#####使用技术
nodejs RabbitMQ node-amqp generic-pool mongodb

#####使用方法
```
git clone https://github.com/mainliner/APNS-rabbitMQ-nodejs
cd APNS-rabbitMQ-nodejs
npm install
```
* 设置settings.js

```
    db: 'mongodb://localhost:27017/wedate', //mongodb 连接地址
    rabbitmq:'localhost',    //rabbitMQ连接地址
    rabbitmqPort:5672,		//rabbitMQ连接端口
    queue: 'APNS',			//订阅的队列名称
    exchange: 'router',		//该队列所绑定的exchange名称
    routingKey: 'A'			//路由关键字
```
* 改写models

subscriber.js中定义了deviceToken的读操作，请自行修改。

* 消息发送

消息的发送位于应用的主服务器，由事件来触发，用一个测试的例子来说明(expressjs).


```
app.rabbitMQConnection = amqp.createConnection({host:"localhost", port:5672});;
app.rabbitMQConnection.on('ready',function(){
        console.log('connect to the rabbitMQ successful');
        app.rabbitMQConnection.exchange('router',{type: 'direct',autoDelete: false,confirm: true},function(exchange){
            app.e = exchange;
        });
});
app.get('/test',function(req,res){
	var encoded_payload = JSON.stringify({'starId':'534ba1488ccd99bf7a63ad75','message':'一条未接来电','badge':1});
	app.e.publish('A',encoded_payload,{},function(err,message){
                    if(err){
                        //need to save the unpush message for resend
                        return res.json(200,{'info':' success'});
                    }
                    return res.json(200,{'info':' success'});
                });
});
```