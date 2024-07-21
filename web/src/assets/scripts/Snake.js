import { AcGameObject } from "./AcGameObject";  
import { Cell } from "./Cell";

export class Snake extends AcGameObject {
    constructor(info, gamemap) {
        super();

        this.id = info.id;
        this.color = info.color;
        this.gamemap = gamemap;
        
        // 初始的时候只有一个点
        // 蛇的身体
        this.cells = [new Cell(info.r, info.c)];

        // 下一个要移动到的位置
        this.next_cell = null;

        // 蛇的速度，每秒移动的格子数
        this.speed = 5;

        // 蛇的方向
        // -1 表示没有方向 0 表示向上 1 表示向右 2 表示向下 3 表示向左
        this.direction = -1;
        // idle 表示空闲状态 move 表示移动状态 die 表示死亡状态
        this.status = "idle";
        // 蛇眼睛的方向
        this.eye_direction = 0;
        if (this.id === 1) {
            this.eye_direction = 2;
        }

        // 蛇眼睛的偏移量
        // 以蛇头为原点，所以这两个眼睛的坐标是相对于蛇头的
        this.eye_dx = [
            [-1, 1],
            [1, 1],
            [1, -1],
            [-1, -1]
        ];
        this.eye_dy = [
            [-1, -1],
            [-1, 1],
            [1, 1],
            [-1, 1]
        ];

        // 蛇的移动方向
        this.dr = [-1, 0, 1, 0];
        this.dc = [0, 1, 0, -1];

        // 蛇的步数
        this.step = 0;

        this.eps = 1e-2;
    }

    start() {

    }

    // 检查当前回合蛇是否应该增加长度
    check_tail_increasing() {
        if (this.step <= 10) return true;
        if (this.step % 3 === 1) return true;
        return false;
    }

    set_direction(d) {
        this.direction = d;
    }

    //  走下一步
    next_step() {
        const d = this.direction;
        this.next_cell = new Cell(this.cells[0].r + this.dr[d], this.cells[0].c + this.dc[d]);
        this.eye_direction = d;
        this.direction = -1;
        this.status = "move";
        this.step ++ ;

        const k = this.cells.length;
        for (let i = k; i > 0; i--) {
            this.cells[i] = JSON.parse(JSON.stringify(this.cells[i - 1]));
        }
        if (!this.gamemap.check_valid(this.next_cell)) {
            this.status = "die";
        }
    }

    // 更新移动 每一帧调用
    update_move() {
        const dx = this.next_cell.x - this.cells[0].x;
        const dy = this.next_cell.y - this.cells[0].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.eps) {
            // 这里必须是用cell等于，不能用cell.c, cell.r
            // 因为我们画的时候是用cell.x, cell.y，而cell.x, cell.y是根据cell.c, cell.r计算出来的
            // 如果直接用cell.c, cell.r，那么cell.x, cell.y就不会更新
            // 之前用的就是cell.c, cell.r，导致蛇的身体更新出现bug
            this.cells[0] = this.next_cell;
            this.next_cell = null;
            this.status = "idle";
            // 如果蛇的长度不应该增加，那么就把尾巴去掉 也就是蛇向前移动了一格
            if (!this.check_tail_increasing()) {
                this.cells.pop();
            }
        } else {
            // 每一帧移动的距离
            const move_distance = this.speed * this.time_delta / 1000;
            // 这个是根据两点之间的距离公式推出来的
            // 假设它们之间是斜着的，然后用边长和斜边的比例关系推出来的
            this.cells[0].x += move_distance * dx / distance;
            this.cells[0].y += move_distance * dy / distance;

            if (!this.check_tail_increasing()) {
                const k = this.cells.length;
                const tail = this.cells[k - 1], tail_target = this.cells[k - 2];
                const tail_dx = tail_target.x - tail.x, tail_dy = tail_target.y - tail.y;
                tail.x += move_distance * tail_dx / distance;
                tail.y += move_distance * tail_dy / distance;
            }
        }
    }

    update() {
        if (this.status === "move") {
            this.update_move();
        }
        this.render();
    }

    render() {
        const width = this.gamemap.width;
        const ctx = this.gamemap.ctx;

        ctx.fillStyle = this.color;

        if (this.status === "die") {
            ctx.fillStyle = 'white';
        }

        for (let i = 0; i < this.cells.length; i++) {
            const cell = this.cells[i];
            ctx.beginPath();
            // * 0.8 是为了让蛇之间有间隔 好看一点
            ctx.arc(cell.x * width, cell.y * width, width / 2 * 0.8, 0, 2 * Math.PI);
            ctx.fill();
        }

        // 两个蛇的身体之间的连接，画矩形填补圆形之间的空隙
        for (let i = 1; i < this.cells.length; i ++ ) {
            const a = this.cells[i - 1], b = this.cells[i];
            if (Math.abs(a.x - b.x) < this.eps && Math.abs(a.y - b.y) < this.eps) continue;
            if (Math.abs(a.x - b.x) < this.eps) {
                // 缩了0.8 那么这个矩形也要跟着移动0.1
                ctx.fillRect(a.x * width - width / 2 + 0.1 * width, Math.min(a.y, b.y) * width, width * 0.8, Math.abs(a.y - b.y) * width);
            } else {
                ctx.fillRect(Math.min(a.x, b.x) * width, a.y * width - width / 2  + 0.1 * width, Math.abs(a.x - b.x) * width, width * 0.8);
            }
        }
        ctx.fillStyle = "black";
        for (let i = 0; i < 2; i++) {
            const eye_x = this.cells[0].x * width + this.eye_dx[this.eye_direction][i] * width * 0.15;
            const eye_y = this.cells[0].y * width + this.eye_dy[this.eye_direction][i] * width * 0.15;
            ctx.beginPath();
            ctx.arc(eye_x, eye_y, width * 0.05, 0, 2 * Math.PI);
            ctx.fill();
        }
    }
}
