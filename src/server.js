import express from 'express';
import cors from 'cors';
import dayjs from 'dayjs'

const app = express();
app.use(cors());

app.use(express.json());

const participants = [];
const messages = [];

app.post('/participants',(req,res)=>{
    if(req.body.name.length===0){
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

    const newMessage = {from: req.body.name, to: 'Todos', text: 'entra na sala...', type: 'status', time: dayjs().format('HH:mm:ss')}
    res.sendStatus(200);
})

app.get('/participants',(req,res)=>{
    res.send(participants);
})


app.listen(4000,()=>{
    console.log('Server is running on port 4000!')
});
