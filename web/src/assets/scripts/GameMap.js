import { AcGameObject } from "./AcGameObject";  
import { Snake } from "./Snake";
import { Wall } from "./Wall";

/**
 * 地图类
 * 用于绘制游戏地图
 * GameMap.vue 用于搭建骨架，GameMap.js 用于实时绘制地图
 */
export class GameMap extends AcGameObject {
    /**
     * 构造函数
     * @param {*} ctx     canvas context
     * @param {*} parent  父对象
     */
    constructor(ctx, parent) {
        super();

        this.ctx = ctx;
        this.parent = parent;

        // 地图小单元方块的边长
        this.width = 0;

        this.rows = 13;
        this.cols = 14;

        this.inner_walls_count = 10;
        this.walls = [];

        this.snakes = [
            new Snake({
                id: 0,
                color: "#4876EC",
                r: this.rows - 2,
                c: 1
            }, this),
            new Snake({
                id: 1,
                color: "#F94848",
                r: 1,
                c: this.cols - 2
            }, this)
        ]
    }
    
    add_listening_event() {
        this.ctx.canvas.focus();
        const [snake0, snake1] = this.snakes;
        this.ctx.canvas.addEventListener("keydown", (e) => {
            if (e.key === "w") {
                snake0.set_direction(0);
            } else if (e.key === "d") {
                snake0.set_direction(1);
            }
            if (e.key === "s") {
                snake0.set_direction(2);
            } else if (e.key === "a") {
                snake0.set_direction(3);
            } else if (e.key === "ArrowUp") {
                snake1.set_direction(0);
            }
            if (e.key === "ArrowRight") {
                snake1.set_direction(1);
            } else if (e.key === "ArrowDown") {
                snake1.set_direction(2);
            } else if (e.key === "ArrowLeft") {
                snake1.set_direction(3);
            }
        });
    }

    start() {
        for (let i = 0; i < 1000; i++) {
            if (this.create_walls()) {
                break;
            }
        }
        this.add_listening_event();
    }
    
    update_size() {
        // 保证地图是正方形
        this.width = parseInt(Math.min(this.parent.clientWidth / this.cols, this.parent.clientHeight / this.rows));
        this.ctx.canvas.width = this.width * this.cols;
        this.ctx.canvas.height = this.width * this.rows;
    }

    // 检查是否所有蛇都准备好了
    check_ready() {
        for (const snake of this.snakes) {
            if (snake.status !== "idle") {
                return false;
            }
            if (snake.direction === -1) {
                return false;
            }
        }
        return true;
    }

    // 检查是否是有效的单元格
    // 用于检查蛇是否撞墙 或者蛇是否撞到某个蛇(包括自己)
    check_valid(cell) {
        if (cell.r < 0 || cell.r >= this.rows) {
            return false;
        }
        if (cell.c < 0 || cell.c >= this.cols) {
            return false;
        }
        for (const wall of this.walls) {
            if (wall.r === cell.r && wall.c === cell.c) {
                return false;
            }
        }
        for (const snake of this.snakes) {
            let k = snake.cells.length;
            // 如果蛇的长度不应该增加，那么就把尾巴去掉 也就是蛇向前移动了一格 那么就不用检查尾巴
            if (!snake.check_tail_increasing()) {
                k--;
            }
            for (let i = 0; i < k; i++) {
                if (snake.cells[i].r === cell.r && snake.cells[i].c === cell.c) {
                    return false;
                }
            }
        }
        return true;
    }

    // 蛇走下一步
    next_step() {
        for (const snake of this.snakes) {
            snake.next_step();
        }
    }

    update() {
        this.update_size();
        if (this.check_ready()) {
            this.next_step();
        }
        this.render();
    }
    
    render() {
        const color_odd = "#A2D149", color_even = "#AAD751";
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                this.ctx.fillStyle = (r + c) % 2 === 0 ? color_even : color_odd;
                this.ctx.fillRect(c * this.width, r * this.width, this.width, this.width);
            }
        }
    }

    // 检查是否有通路
    check_connectivity(g, sx, sy, tx, ty) {
        if (sx === tx && sy === ty) {
            return true;
        }
        g[sx][sy] = true;

        const dx = [0, 0, 1, -1];
        const dy = [1, -1, 0, 0];
        for (let i = 0; i < 4; i++) {
            const x = sx + dx[i];
            const y = sy + dy[i];
            if (x >= 0 && x < this.rows && y >= 0 && y < this.cols && !g[x][y]) {
                if (this.check_connectivity(g, x, y, tx, ty)) {
                    return true;
                }
            }
        }
        return false; 
    }

    create_walls() {
        const g = Array.from({ length: this.rows }, () => Array(this.cols).fill(false));

        // 创建外围墙
        for (let r = 0; r < this.rows; r++) {
            g[r][0] = g[r][this.cols - 1] = true;
        }
        for (let c = 0; c < this.cols; c++) {
            g[0][c] = g[this.rows - 1][c] = true;
        }

        // 创建随机内墙 轴对称
        for (let i = 0; i < this.inner_walls_count; i++) {
            for (let j = 0; j < 1000; j++) {
                let r = parseInt(Math.random() * this.rows);
                let c = parseInt(Math.random() * this.cols);
                if ((r === this.rows - 2 && c === 1) || (r === 1 && c === this.cols - 2)) {
                    continue;
                }
                if (g[r][c] || g[this.rows - 1 - r][this.cols - 1 - c]) {
                    continue;
                }
                g[r][c] = g[this.rows - 1 - r][this.cols - 1 - c] = true;
                break;
            }
        }

        const copy_g = JSON.parse(JSON.stringify(g));
        if (!this.check_connectivity(copy_g, this.rows - 2, 1, 1, this.cols - 2)) {
            return false;
        }

        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                if (g[r][c]) {
                    this.walls.push(new Wall(r, c, this));
                }
            }
        }

        return true;
    }
}
