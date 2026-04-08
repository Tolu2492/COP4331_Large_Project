require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb'); 

const app = express();
app.use(cors());
app.use(express.json());

app.use((req, res, next) => 
{
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PATCH, DELETE, OPTIONS'
  );
  next();
});

const url = process.env.MONGODB_URI;
const client = new MongoClient(url);

let db;
let usersCollection;
let cardsCollection;

var cardList = 
[
  'Roy Campanella',
  'Paul Molitor',
  'Tony Gwynn',
  'Dennis Eckersley',
  'Reggie Jackson',
  'Gaylord Perry',
  'Buck Leonard',
  'Rollie Fingers',
  'Charlie Gehringer',
  'Wade Boggs',
  'Carl Hubbell',
  'Dave Winfield',
  'Jackie Robinson',
  'Ken Griffey, Jr.',
  'Al Simmons',
  'Chuck Klein',
  'Mel Ott',
  'Mark McGwire',
  'Nolan Ryan',
  'Ralph Kiner',
  'Yogi Berra',
  'Goose Goslin',
  'Greg Maddux',
  'Frankie Frisch',
  'Ernie Banks',
  'Ozzie Smith',
  'Hank Greenberg',
  'Kirby Puckett',
  'Bob Feller',
  'Dizzy Dean',
  'Joe Jackson',
  'Sam Crawford',
  'Barry Bonds',
  'Duke Snider',
  'George Sisler',
  'Ed Walsh',
  'Tom Seaver',
  'Willie Stargell',
  'Bob Gibson',
  'Brooks Robinson',
  'Steve Carlton',
  'Joe Medwick',
  'Nap Lajoie',
  'Cal Ripken, Jr.',
  'Mike Schmidt',
  'Eddie Murray',
  'Tris Speaker',
  'Al Kaline',
  'Sandy Koufax',
  'Willie Keeler',
  'Pete Rose',
  'Robin Roberts',
  'Eddie Collins',
  'Lefty Gomez',
  'Lefty Grove',
  'Carl Yastrzemski',
  'Frank Robinson',
  'Juan Marichal',
  'Warren Spahn',
  'Pie Traynor',
  'Roberto Clemente',
  'Harmon Killebrew',
  'Satchel Paige',
  'Eddie Plank',
  'Josh Gibson',
  'Oscar Charleston',
  'Mickey Mantle',
  'Cool Papa Bell',
  'Johnny Bench',
  'Mickey Cochrane',
  'Jimmie Foxx',
  'Jim Palmer',
  'Cy Young',
  'Eddie Mathews',
  'Honus Wagner',
  'Paul Waner',
  'Grover Alexander',
  'Rod Carew',
  'Joe DiMaggio',
  'Joe Morgan',
  'Stan Musial',
  'Bill Terry',
  'Rogers Hornsby',
  'Lou Brock',
  'Ted Williams',
  'Bill Dickey',
  'Christy Mathewson',
  'Willie McCovey',
  'Lou Gehrig',
  'George Brett',
  'Hank Aaron',
  'Harry Heilmann',
  'Walter Johnson',
  'Roger Clemens',
  'Ty Cobb',
  'Whitey Ford',
  'Willie Mays',
  'Rickey Henderson',
  'Babe Ruth'
];

app.post('/api/addcard', async (req, res) =>
{
  const { userId, card } = req.body;

  try
  {
    await cardsCollection.insertOne({
      userId,
      card
    });

    res.status(200).json({ error: '' });
  }
  catch (err)
  {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/login', async (req, res) =>
{
  const { login, password } = req.body;

  try
  {
    const user = await usersCollection.findOne({ login, password });

    if (!user)
    {
      return res.status(200).json({
        id: -1,
        firstName: '',
        lastName: '',
        error: 'Invalid user name/password'
      });
    }

    res.status(200).json({
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      error: ''
    });
  }
  catch (err)
  {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/searchcards', async (req, res) =>
{
  const { userId, search } = req.body;

  try
  {
    const results = await cardsCollection.find({
      userId: userId,
      card: { $regex: search, $options: 'i' }
    }).toArray();

    const cards = results.map(x => x.card);

    res.status(200).json({ results: cards, error: '' });
  }
  catch (err)
  {
    res.status(500).json({ results: [], error: err.message });
  }
});

let users = [
  { id: 1, login: "rickl", password: "COP4331", firstName: "Rick", lastName: "Leinecker" }
];

app.post('/api/register', async (req, res) =>
{
  const { login, password, firstName, lastName } = req.body;

  try
  {
    const existing = await usersCollection.findOne({ login: login });

    if (existing)
    {
      return res.status(400).json({ error: 'User already exists' });
    }

    await usersCollection.insertOne({
      login,
      password,
      firstName,
      lastName
    });

    res.status(200).json({ error: '' });
  }
  catch (err)
  {
    res.status(500).json({ error: err.message });
  }
});

async function startServer()
{
  try
  {
    await client.connect();

    db = client.db('COP4331');
    usersCollection = db.collection('Users');
    cardsCollection = db.collection('Cards');

    console.log('MongoDB connected');

    app.listen(5000, () =>
    {
      console.log('Server running on port 5000');
    });
  }
  catch (err)
  {
    console.error('MongoDB connection failed:', err);
  }
}
startServer();  

