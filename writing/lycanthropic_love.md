:title Lycanthropic Love
:description An experiment with Elm and Hammer.js
:date 2016-10-18

For the past few months I have been working with a team of puzzlers to write a puzzle hunt for the DC area called [DCPH&reg;](https://dcphr.org)[^1].
A puzzle hunt is an event where teams of people compete to solve puzzles of all types at different locations around the city.
Our first hunt was run last weekend in Clarendon.
This post describes my experience writing one of the puzzles __Lycanthropic Love__.

Brief tangent: DCPH&reg; is an annual event. We are always looking for more people to help write, test, and run the hunt. [Contact me](/contact) if you are interested in participating in developing next year's hunt.

Take a moment now to go look at the final product hosted at [dcphr.org](https://dcphr.org/2016/puzzles/lycanthropiclove.html). The rest of this post will dive into the details of both the puzzle mechanics and their implementation in the browser with Elm. So, beware of spoilers.

I chose to work on this puzzle specifically to experiment with new browser technologies.
So I couldn't go with plain JavaScript.
I'm drawn to languages over frameworks, which leaves me with ClojureScript, CoffeeScript, TypeScript, or Elm.
Past experience with Clojure and ClojureScript left me wanting more useful error messages and less Java dependencies.
CoffeeScript and TypeScript are supersets of JavaScript which forces them to maintain / paper over some of the JavaScript ugliness (the exact thing I was trying to avoid).
Which leaves Elm.

Elm provides a runtime which handles the interaction with the DOM and JavaScript and thus allows me to focus on my business logic.
Immutability, friendly errors, and strong typing also match closely with my recent rust experience.
So Elm it is.

Lycanthropic Love is a satirical dating app for Werewolves.
Inspired by Tinder, you are presented with matches.
For each match you are expected to swipe right for yes and left for no.
In this puzzle you are presented with 7 different profiles.
Your job is to read each profile, determine a pattern for what they like, and then select the appropriate matches.

Each profile contains a list of likes.
All of the likes have a common relationship.
The matches which should be swiped right also have this relationship.
For example, the Bare Wolf lists his likes as "Pandemonium", "discount sales", "education", and "Pabst Blue Ribbon".
Each of these items contain each vowel exactly once, also known as supervocalics.

Once all of the matches are swiped, the results are listed on the main page as a series of paws up or down.
These five swipes can then be converted to a letter using a binary table (common encoding technique provided in the intro packet).
The answer to the puzzle is a seven letter word.

Now for the fun part: writing web page.
Let's start with the wolf data structure (called Models in Elm).

    type alias Wolf =
      { name            : String
      , imgLink         : String
      , likes           : List String
      , matches         : List Match
      }

    type alias Match =
      { name            : String
      , imgLink         : String
      , shouldLike      : Bool
      , swipe           : Maybe SwipeDirection
      }

    type SwipeDirection
      = Left
      | Right

I chose to store the matches inside of the `Wolf` type and the `SwipeDirection` inside of the `Match`.
This choice allowed rendering to be a straightforward tree walk, while storing a swipe requires two list lookups, both for the wolf and the match
I later found out (while watching an [elm-conf presentation](https://www.youtube.com/watch?v=IcgmSRJHu_8)) that a Ziplist[^2] would have been the correct compromise.

To provide a taste of the rendering section, let's look at the process for rendering the profile screen for a single wolf.
The function takes a `Maybe Wolf` since it is possible that a wolf hasn't been selected yet (likely due to the refresh or back button, one of the many areas that could be improved) and returns a request to the Elm runtime (and virtual dom) to add nodes to the DOM tree.
This indirection is one of the key reasons Elm is both safe and fast.
Developers only write requests and must deal with both the success and failure of that request.
The Elm runtime then optimizes DOM insertions with one of the fastest virtual DOM implementations.

    renderCurrent : Maybe Wolf -> Html Msg
    renderCurrent wolf =
      case wolf of
        Just wolf ->
          let dislikes =
            case List.length(wolf.dislikes) of
              0 -> div [] []
              _ -> div []
                   [ h3 [] [ text "Dislikes" ]
                   , div [] [ text (String.join ", " wolf.dislikes) ]
                   ]
          in
          div [ class "wolf-profile" ]
          [ wolfIcon (onClick NoOp) wolf
          , h1 [] [ text wolf.name ]
          -- , h2 [] [ text wolf.epitat ]
          , h3 [] [ text "Likes" ]
          , div [] [ text ( String.join ", " wolf.likes ) ]
          , dislikes
          , a [ class "button",  onClick ShowMatches ] [ text "View Matches" ]
          , a [ class "button", onClick Logout ] [ text "Back" ]
          ]
        Nothing -> div [ class "error" ] [ text "Render Current triggered without a wolf" ]

To demonstrate both the consequences of the `Wolf` type structure and my lack of experience with Elm, here is the code which stores the swipes. Maybe chaining and ziplists would drastically reduce the size of this code snippet.

    Swipe direction ->
      case state.mode of
        All -> (state, Cmd.none)
        Current -> (state, Cmd.none)
        _ ->
          case lookupWolf state.currentWolf state.wolves of
            Just wolf ->
              let state =
                storeSwipe direction state
              in
              case state.currentMatch of
                Just matchIndex ->
                  case List.head (List.drop matchIndex wolf.matches) of
                    Just matchedWolf ->
                      case optionallyIncrement state.currentMatch of
                        Just n ->
                          case n >= List.length(wolf.matches) of
                          True ->
                            ( { state
                              | currentMatch = Just 0
                              , mode = All
                              }
                              , Navigation.newUrl (toPath All)
                            )
                          False ->
                            ( { state
                              | currentMatch = Just n
                              }
                              , Cmd.none
                            )
                        Nothing ->
                          ( { state
                            | currentMatch = Nothing
                            , mode = All
                            }
                            , Navigation.newUrl (toPath All)
                          )
                    Nothing -> (
                      { state
                      | mode = All
                      , currentMatch = Nothing
                      }
                      , Navigation.newUrl (toPath All))
                Nothing ->(state, Cmd.none)
            Nothing -> ( -- Landing page was swiped away
              { state
              | mode = All
              }
              , Navigation.newUrl (toPath All))

In order to capture the swipe I had to fall back to JavaScript and the [Hammer.js](http://hammerjs.github.io/) library.
Elm uses `ports` and `subscriptions` to communicate with JavaScript.
The code below is slightly bloated due to dynamically attaching event listeners tonodes (which represent the swipeable object) as they are added to the DOM.
The virtual dom asynchronously updates the actual dom nodes, hence the setInterval to periodically test whether the node is ready or not.

    var app = Elm.Main.fullscreen()

    app.ports.match.subscribe(function(id) {
      var interval = setInterval(function() {
        var el = document.getElementById(id)
        if(el) { window.clearInterval(interval) }
        else { return }
        var hammertime = new Hammer(el, null)
        el.style.display = "block"
        var element_width = el.getBoundingClientRect().width / 2
        el.style.left = window.innerWidth / 2 - element_width + "px"

        // ignore pan event which comes after swipe due to javascript event ordering
        var swiped = false

        if(registered) { return }
        hammertime.on("pan", function (event) {
          if(swiped) { swiped = false; return }
          el.style.left = event.center.x - element_width + "px"
        })

        hammertime.on('swipe', function(ev) {
          swiped = true

          if(ev.direction == Hammer.DIRECTION_RIGHT) {
            app.ports.swipe.send("right")
          } else if(ev.direction == Hammer.DIRECTION_LEFT) {
            app.ports.swipe.send("left")
          } else {
            return
          }

          element_width = el.getBoundingClientRect().width / 2
          el.style.left = (window.innerWidth / 2) - element_width + "px"
        })

        registered = true
      })
    }, 10)

Despite some less than ideal choices, Elm was easy to get started with.
By forcing me to think about my data model up front I ended up with a cleaner application.
I look forward to using Elm on my next project.

[^1]: DCPH&reg; is pronunced "Decipher" and stands for DC Puzzle Hunt. We never came up with a useable acronym which used the "R" so we opted to use the registered trademark symbol instead.
[^2]: A ziplist stores a list as three components `Before`, `Current`, `After`; where `Before` and `After` are lists themselves.
