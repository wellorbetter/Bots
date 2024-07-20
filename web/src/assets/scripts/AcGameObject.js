const AC_GAME_OBJECTS = [];

export class AcGameObject {
  constructor() {
    this.has_called_start = false;
    this.time_delta = 0;
    AC_GAME_OBJECTS.push(this);
  }

  start() {
  }

  update() {

  }

  on_destroy() {

  }

  destroy() {
    this.on_destroy()
    for (let i in AC_GAME_OBJECTS) {
      const obj = AC_GAME_OBJECTS[i];
      if (obj === this) {
        AC_GAME_OBJECTS.splice(i);
        break;
      }
    }
  }
}

let last_timestamp = 0;
const step = (timestamp) => {
    for (let obj of AC_GAME_OBJECTS) {
        if (!obj.has_called_start) {
            obj.has_called_start = true;
            obj.start();
        } else {
          obj.time_delta = timestamp - last_timestamp;
          obj.update();
        }
    }
    last_timestamp = timestamp;
    requestAnimationFrame(step);
}

requestAnimationFrame(step);