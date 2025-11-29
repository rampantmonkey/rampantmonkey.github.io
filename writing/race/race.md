:title RACE
:description A video game style vehicle dynamics simulator
:date 2025-11-30
:category Computer Science

Over the Thanksgiving holiday this year I decided to dive into [vehicle dynamics simulations](/files/race/index.html)
Racing games are some of my favorite to play and I recently watched this [talk by Wassimulator](https://wassimulator.com/blog/programming/programming_vehicles_in_games.html) at Better Software Conference.
I opted to use javascript so that I could easily publish it here and spend zero time worrying about layout.

Following along with the talk I implemented a simple engine, tire model, and physics loop with plots for each item.
I then implemented a 0-60 and quarter mile simulation to start to test my model.

The trickiest part was adding the wheel dynamics feedback loop.
Cranking down the step size and switching to runge-kutta 4 got the simulation stable.
Not a satisfying answer and definitely something I plan to come back to and understand more fully.

I'd also like to build an optimizer to use genetic algorithms to find an ideal vehicle setup.

