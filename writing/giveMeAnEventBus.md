:title giveMeAnEventBus
:description Creating an event bus to decouple components and share information across pages.
:date 2022-08-08
:category Web Development

Feeling down?
No need to inject yourself with dependencies, just call 1-800-`giveMeAnEventBus` today.
The event bus will arrive immediately and you can `subscribe` to all of the latest news.
You can even `publish` your own stories.

And that's not all.
If you provide the magic key[^1], you can even communicate with your friends in neighboring tabs.

<pre>
const giveMeAnEventBus = (() => {
  let eventBusId = 0

  return (key=null) => {
    eventBusId++
    let subscribers = []
    let subscriberId = 0

    if(key) {
      window.addEventListener('storage', (e) => {
        if(e.key === key) {
          try { var value = JSON.parse(e.newValue) }
          catch(err) { return }
          publish(value.payload, false)
        }
      })

      setTimeout(() => {
        const initialValues = JSON.parse(localStorage.getItem(key))
        if(initialValues) {
          publish(initialValues.payload, false)
        }
      }, 0)
    }


    const unsubscribe = (handle) => {
      if(handle.eventBusId === eventBusId) {
        for(var i=0, l=subscribers.length; i < l; i++) {
          if(subscribers[i].subscriberId === handle.subscriberId) {
            subscribers.splice(i, 1)
            return
          }
        }
      }
    }

    const subscribe = (cb) => {
      subscriberId++
      subscribers.push({cb, subscriberId})
      let handle = { subscriberId, eventBusId }
      handle.unsubscribe = () => unsubscribe(handle)
      return handle
    }

    let eventId = 0
    const publish = ((event, persist=true) => {
      eventId++
      subscribers.forEach(s => s.cb({eventId, payload: event}))
      if(persist) {
        localStorage.setItem(key, JSON.stringify({payload: event, nonce: new Date()}))
      }
    }

    return { subscribe, unsubscribe, publish }
  }
})()
</pre>

[^1]: If a string `key` is provided, the messages are saved to local storage under that key. This will then trigger the `storage` event to be fired in every other document from the same domain. Which is then caught by our event listener and republished to all subscribers in its own document. To bootstrap the process we also check for the lastest persisted message on bus creation. This check and load is defered until after the initial round of subscribers have a chance to connect. _Just cooperative-multitasking things_.
