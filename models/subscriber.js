var mongodbPool = require('./db');



exports.getSubscriberbyStarId = function(starId,callback){
        mongodbPool.acquire(function (err,db){
            if(err){
                return callback(err);
            }
            db.collection('subscriber',function(err,collection){
                if(err){
                    mongodbPool.release(db);
                    return callback(err);
                }
                collection.find({'starId':starId}).toArray(function(err,docs){
                    mongodbPool.release(db);
                    if(err){
                        return callback(err);
                    }else{
                        return callback(null,docs);
                    }
                });
            });
        });
};