import express from 'express';
import cors from 'cors';
import dayjs from 'dayjs';
import fs from 'fs'

const app = express();
app.use(cors());

app.use(express.json());

let participants = [{name: 'walteir', lastStatus: 1623379380731},{name: 'Maria', lastStatus: 1623379380780}];
let messages = [];


app.post('/participants',(req,res)=>{
    if(!req.body.name){
        res.status(400).send("Something is wrong...");
        return;
    }
    const thisNameExist = participants.find((e)=>e.name===req.body.name);
    if(thisNameExist){
        res.status(400).send("Something is wrong...");
        return;
    }
    const newParticipant = {...req.body, lastStatus:Date.now()};
    participants.push(newParticipant);
    const newMessage = {from: req.body.name, to: 'Todos', text: 'entra na sala...', type: 'status', time: dayjs().format('HH:mm:ss')};
    messages.push(newMessage);
    res.sendStatus(200);
})

app.get('/participants',(req,res)=>{
    //res.send(participants);
    res.json(participants);
})

app.post('/messages',(req,res)=>{
    console.log(req.body)
    if(!req.header('User')){
        res.sendStatus(400);
        return;
    }
    if(!(req.body.to && req.body.text)){
        res.sendStatus(400);
        return;
    }
    if((req.body.type !== 'message') && (req.body.type !== 'private_message')){
        res.sendStatus(400);
        return;
    }
    if(!(participants.find((e)=>e.name===req.header('User')))){
        res.sendStatus(400);
        return;
    }
    const newMessage = {from: req.header('User'), to: req.body.to, text: req.body.text, type: req.body.type, time: dayjs().format('HH:mm:ss')}
    messages.push(newMessage);
    res.sendStatus(200);
})

app.get('/messages',(req,res)=>{
    if(!req.header('User')){
        res.sendStatus(400);
        return;
    }
    const filterMessages = messages.filter((e)=> e.type==='status' || e.type==='message' || e.to===req.header('User') || e.from===req.header('User') )
    if(req.query.limit){
        res.json(filterMessages.slice(-parseInt(req.query.limit)));
        return;
    }
    res.json(filterMessages);
})

app.post('/status',(req,res)=>{
    if(!req.header('User')){
        res.sendStatus(400);
        return;
    }
    const participant = participants.find((e)=>e.name===req.header('User'));
    if(!participant){
        res.sendStatus(400);
        return;
    }

    // const newParticipants = participants.filter((e)=>e.name!==participant.name);
    // participants = [...newParticipants];
    // participant.lastStatus=Date.now();
    // participants=[...newParticipants,participant];

    const index = participants.findIndex((e)=>e.name===req.header('User'));
    participants[index].lastStatus = Date.now();
    res.sendStatus(200);
})

setInterval(()=>{
    const offlineParticipants = participants.filter((e)=>Date.now()-e.lastStatus>10000);
    offlineParticipants.forEach((e)=>{
        const offlineMessage = {from: e.name , to: 'Todos', text: 'sai da sala...', type: 'status', time: dayjs().format('HH:mm:ss')}
        messages.push(offlineMessage);
    })
    const onlineParticipants = participants.filter((e)=>Date.now()-e.lastStatus<=10000);
    participants = [...onlineParticipants];
},15000)

app.listen(4000,()=>{
    console.log('Server is running on port 4000!')
});


// const newParticipants = participants.filter((e)=>e.name!==participant.name);
//     if(Date.now()-participant.lastStatus>10){
//         participants = [...newParticipants];
//     }else{
//         participant.lastStatus=Date.now();
//         participants=[...newParticipants,participant];
//     }