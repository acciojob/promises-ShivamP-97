//your JS code here. If required.
class MyPromise {
  constructor(executor) {
    this._state = "pending";     
    this._value = null;          
    this._handlers = [];         

    const resolve = (value) => {
      this._settle("fulfilled", value);
    };

    const reject = (value) => {
      this._settle("rejected", value);
    };

    try {
      executor(resolve, reject);
    } catch (err) {
      reject(err);
    }
  }

  get state() {
    return this._state;
  }

  get value() {
    return this._state === "pending" ? null : this._value;
  }

  _settle(newState, newValue) {
    if (this._state !== "pending") return; 

    this._state = newState;
    this._value = newValue;

    queueMicrotask(() => {
      this._runHandlers();
    });
  }

  _runHandlers() {
    while (this._handlers.length > 0) {
      const { onFulfilled, onRejected, resolve, reject } = this._handlers.shift();

      try {
        if (this._state === "fulfilled") {
          if (onFulfilled) {
            const result = onFulfilled(this._value);
            resolve(result);
          } else {
            resolve(this._value); 
          }
        } else {
          if (onRejected) {
            const result = onRejected(this._value);
            resolve(result);
          } else {
            reject(this._value); 
          }
        }
      } catch (err) {
        reject(err);
      }
    }
  }

  then(onFulfilled, onRejected) {
    return new MyPromise((resolve, reject) => {
      this._handlers.push({ onFulfilled, onRejected, resolve, reject });

      if (this._state !== "pending") {
        queueMicrotask(() => this._runHandlers());
      }
    });
  }

  catch(onRejected) {
    return this.then(undefined, onRejected);
  }
}

module.exports = MyPromise;
