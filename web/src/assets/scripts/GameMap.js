import { AcGameObject } from "./AcGameObject";  
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
        this.cols = 13;

        this.inner_walls_count = 20;
        this.walls = [];
    }
    
    start() {
        for (let i = 0; i < 1000; i ++ ) {
            if (this.create_walls()) {
                break;
            }
        }
    }
    
    update_size() {
        // 保证地图是正方形
        this.width = parseInt(Math.min(this.parent.clientWidth / this.cols, this.parent.clientHeight / this.rows));
        this.ctx.canvas.width = this.width * this.cols;
        this.ctx.canvas.height = this.width * this.rows;
    }

    update() {
        this.update_size();
        this.render();
    }
    
    render() {
        const color_odd = "#A2D149", color_even = "#AAD751";
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                this.ctx.fillStyle = (r + c) % 2 === 0 ? color_even : color_odd;
                // 水平坐标 c * this.width，垂直坐标 r * this.width
                this.ctx.fillRect(c * this.width, r * this.width, this.width, this.width);
            }
        }
    }

    // 检查是否有通路
    check_connectivity(g, sx, sy, tx, ty) {
        if (sx == tx && sy == ty) {
            return true;
        }
        g[sx][sy] = true;

        const dx = [0, 0, 1, -1];
        const dy = [1, -1, 0, 0];
        for (let i = 0; i < 4; i ++ ) {
            const x = sx + dx[i];
            const y = sy + dy[i];
            if (x >= 0 && x < this.rows && y >= 0 && y < this.cols && !g[x][y]) {
                if (this.check_connectivity(g, x, y, tx, ty)) {
                    return true;
                }
            }
        }
    }

    create_walls() {
        const g = [];
        for (let r = 0; r < this.rows; r ++ ) {
            g[r] = [];
            for (let c = 0; c < this.cols; c ++ ) {
                g[r][c] = false;
            }
        }

        // 创建外围墙
        for (let r = 0; r < this.rows; r ++ ) {
            g[r][0] = g[r][this.cols - 1] = true;
        }
        for (let c = 0; c < this.cols; c ++ ) {
            g[0][c] = g[this.rows - 1][c] = true;
        }

        // 创建随机内墙 轴对称
        for (let i = 0; i < this.inner_walls_count; i ++ ) {
            // 墙的数量比较少，循环次数不会太多
            for (let j = 0; j < 1000; j ++ ) {
                let r = parseInt(Math.random() * this.rows);
                let c = parseInt(Math.random() * this.cols);
                // 不会覆盖左下角和右上角的蛇的位置
                if (r == this.rows - 2 && c == 1 || r == 1 && c == this.cols - 2) {
                    continue;
                }
                if (g[r][c] || g[c][r]) {
                    continue;
                }
                g[r][c] = g[c][r] = true;
                break;
            }
        }

        // deepcopy dfs这里会修改g，所以需要深拷贝
        const copy_g = JSON.parse(JSON.stringify(g));
        // 经典迷宫dfs检查是否有通路
        if (!this.check_connectivity(copy_g, this.rows - 2, 1, 1, this.cols - 2)) {
            return false;
        }
        // 画墙
        for (let r = 0; r < this.rows; r ++ ) {
            for (let c = 0; c < this.cols; c ++ ) {
                if (g[r][c]) {
                    this.walls.push(new Wall(r, c, this));
                }
            }
        }

        return true;
    }
}