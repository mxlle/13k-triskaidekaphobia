export const PubSubEvent = {
  NEW_GAME: 0,
  GAME_OVER: 1,
  STARS_CHANGED: 2,
};

/**
 * A service that allows components to subscribe to events and publish events.
 */
export class PubSubService {
  constructor() {
    this._subscriptions = {};
  }

  /**
   * Subscribes to an event.
   */
  subscribe(event, callback) {
    if (!this._subscriptions[event]) {
      this._subscriptions[event] = [];
    }

    this._subscriptions[event].push(callback);
  }

  /**
   * Unsubscribes from an event.
   */
  unsubscribe(event, callback) {
    if (!this._subscriptions[event]) {
      return;
    }

    this._subscriptions[event] = this._subscriptions[event].filter(
      (cb) => cb !== callback
    );
  }

  /**
   * Publishes an event.
   */
  publish(event, data) {
    if (!this._subscriptions[event]) {
      return;
    }

    this._subscriptions[event].forEach((cb) => cb(data));
  }
}

export const pubSubService = new PubSubService();
