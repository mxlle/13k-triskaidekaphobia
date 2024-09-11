# Welcome to the Society of Multiphobics
In this puzzle game you have the role of an Event Planner for the dinner of the Society of Multiphobics. 

Your task is to assign all the guests to chairs at the tables in such a way that no phobia is triggered.

## Info & Controls
All levels are solvable.

All the required information is displayed within the game, but here are some backup infos just in case:
- the guests are represented by emojis
- the phobias of each emoji are represented below the emoji (again with emojis) 
- everyone suffers from triskaidekaphobia
- select an emoji to get a larger preview and more information about the phobias
- change the position by using drag and drop or clicking an empty chair
- you can also use the empty fields as intermediate storage
- the game is won when all guests are seated correctly
- intermediately triggered phobias are fine, as long as they are resolved in the end
  - sometimes it is even required to temporarily trigger phobias in order to solve the level 


- note: some guests are represented by object emojis, treat them as persons nevertheless, we don't want to discriminate anyone :)

### About the score calculation
The score is based on the amount of moves. 

You get the highest score (9999⭐️) if you solve the level in the least amount of moves possible.

When you need as much moves as the level has guests, you still get 2000⭐️. 

Then it slowly decreases to 0⭐️ when you need more than ~3x the amount of moves.

Note: Calculating the optimal amount of moves ("par") was one of the hardest parts to implement. 
- I spent around 10 hrs trying to get it perfect, but in the end I had to settle for a good enough solution. 
- Biggest issue was performance due to deep recursions. 
- But now I am using an "educated guess" based on the amount of guests that have to switch tables, plus some additional checks. 
- It is not perfect, but should be good enough for most cases.

## Stats & Fun Facts
- this is my 4th time participating
- I worked ~90 hours on this game (longest time so far), but I had a lot of fun 😁
- My husband supported me an additional ~10 hours (DevOps + the drag&drop feature)
- 10% of the coding happened on a plane over the Atlantic Ocean ✈️ and another ~30% while travelling the US 🇺🇸 
- I spent around 4 hours on the music using SoundBox. I used the only song I know how to play on the piano 🎹 and added some drums and bass
- I did around 15 iterations with Poki playtests, which gave me some good insights, especially to improve the tutorial
  - The first couple of playtest recordings were quite brutal to watch 😨
  - But in my last iteration, I finally had all 10 testers at least doing the first tutorial, half of them doing all 3 tutorials and 1 person even doing a couple of regular levels
- I like emojis 🙃

## Next steps if I had more time and space
- improve scoring system
- additional modes, e.g. time-based or gambling
- add custom svgs
- add sounds
