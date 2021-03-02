const canvas = document.querySelector<HTMLCanvasElement>("#js-canvas");
const relativeWidth = 100;
const relativeHeight = 100;

class Point {
    x: number;
    y: number;
    z: number;

    constructor(x: number, y: number, z: number = 1) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    toRelative = (): Point => {
        let unitWidth = canvas.width / relativeWidth;
        let unitHeight = canvas.height / relativeHeight;
        return new Point((this.x - (canvas.width / 2)) / unitWidth, (this.y - (canvas.height / 2)) / unitHeight)
    }

    toAbsolute = (): Point => {
        let unitWidth = canvas.width / relativeWidth;
        let unitHeight = canvas.height / relativeHeight;
        return new Point((canvas.width / 2) + (this.x * unitWidth), (canvas.height / 2) - (this.y * unitHeight))
    }

    multiplyByMatrix = (matrix: Matrix3): Point => {
        let c0r0 = matrix.array[0], c1r0 = matrix.array[1], c2r0 = matrix.array[2];
        let c0r1 = matrix.array[3], c1r1 = matrix.array[4], c2r1 = matrix.array[5];
        let c0r2 = matrix.array[6], c1r2 = matrix.array[7], c2r2 = matrix.array[8];
        // let resultX = (this.x * c0r0) + (this.y * c0r1) + (this.z * c0r2);
        // let resultY = (this.x * c1r0) + (this.y * c1r1) + (this.z * c1r2);
        // let resultZ = (this.x * c2r0) + (this.y * c2r1) + (this.z * c2r2);
        let resultX = (this.x * c0r0) + (this.y * c1r0) + (this.z * c2r0);
        let resultY = (this.x * c0r1) + (this.y * c1r1) + (this.z * c2r1);
        let resultZ = (this.x * c0r2) + (this.y * c1r2) + (this.z * c2r2);
        return new Point(resultX, resultY, resultZ);
    }
}

class Matrix3 {
    array: number[];
    constructor(array: number[]){
        if (array.length !== 9) throw 'Invalid array';
        this.array = array;
    }

    multiplyMatrices = (matrix: Matrix3) => {
        let col0 = new Point(matrix.array[0], matrix.array[3], matrix.array[6]);
        let col1 = new Point(matrix.array[1], matrix.array[4], matrix.array[7]);
        let col2 = new Point(matrix.array[2], matrix.array[5], matrix.array[8]);
        let result0 = col0.multiplyByMatrix(this);
        let result1 = col1.multiplyByMatrix(this);
        let result2 = col2.multiplyByMatrix(this);
        return new Matrix3([
            result0.x, result1.x, result2.x,
            result0.y, result1.y, result2.y,
            result0.z, result1.z, result2.z
        ]);
    }
}

class Figure {
    center: Point;
    points: Point[];
    transformedPoints: Point[];
    r: number;

    transform: Matrix3;

    constructor(p: Point, scale: number = 12){
        this.center = p;
        let d = scale / 2;
        this.r = scale / 4;
        this.points = []
        this.points[0] = new Point(p.x, p.y - this.r);
        this.points[1] = new Point(this.points[0].x + d * Math.cos(0.628319), this.points[0].y - d * Math.sin(0.628319));   //36'
        this.points[2] = new Point(this.points[1].x + d * Math.cos(1.88496), this.points[1].y + d * Math.sin(1.88496));     //108'
        this.points[3] = new Point(this.points[2].x + d * Math.cos(0.628319), this.points[2].y + d * Math.sin(0.628319));   //36'
        this.points[4] = new Point(this.points[3].x - d, this.points[3].y);                                                 //180'
        this.points[5] = new Point(this.points[4].x + d * Math.cos(1.88496), this.points[4].y + d * Math.sin(1.88496));     //108'
        this.points[6] = new Point(this.points[5].x + d * Math.cos(1.88496), this.points[5].y - d * Math.sin(1.88496));     //108'
        this.points[7] = new Point(this.points[6].x - d, this.points[6].y);                                                 //180'
        this.points[8] = new Point(this.points[7].x + d * Math.cos(0.628319), this.points[7].y - d * Math.sin(0.628319));   //36'
        this.points[9] = new Point(this.points[8].x + d * Math.cos(1.88496), this.points[8].y - d * Math.sin(1.88496));     //108'
    }

    setTransform = (m: Matrix3) => {
        this.transform = m;
        // this.update();
    }

    addTransform = (m: Matrix3) => {
        if (this.transform) {
            this.transform = this.transform.multiplyMatrices(m);
            // this.update();
        }
    }

    // update = () => {
    //     for (let i = 0; i < this.points.length; i++)
    //         this.points[i] = this.points[i].multiplyByMatrix(this.transform);
        
    //     this.center = this.center.multiplyByMatrix(this.transform);
    // }

    draw = () => {
        this.points.forEach(e => {
            // drawCircle(e, 1, 'red')
        })

        var ctx = canvas.getContext("2d");
        ctx.strokeStyle = "#000000";
        ctx.beginPath();
        // ctx.moveTo(this.center.toAbsolute().x, this.center.toAbsolute().y);
        ctx.arc(this.center.multiplyByMatrix(this.transform).toAbsolute().x, this.center.multiplyByMatrix(this.transform).toAbsolute().y, this.r * 10, 0, Math.PI * 2);
        ctx.fillStyle = 'none'
        ctx.stroke();

        drawLine(this.points[0].multiplyByMatrix(this.transform), this.points[1].multiplyByMatrix(this.transform))
        drawLine(this.points[1].multiplyByMatrix(this.transform), this.points[2].multiplyByMatrix(this.transform))
        drawLine(this.points[2].multiplyByMatrix(this.transform), this.points[3].multiplyByMatrix(this.transform))
        drawLine(this.points[3].multiplyByMatrix(this.transform), this.points[4].multiplyByMatrix(this.transform))
        drawLine(this.points[4].multiplyByMatrix(this.transform), this.points[5].multiplyByMatrix(this.transform))
        drawLine(this.points[5].multiplyByMatrix(this.transform), this.points[6].multiplyByMatrix(this.transform))
        drawLine(this.points[6].multiplyByMatrix(this.transform), this.points[7].multiplyByMatrix(this.transform))
        drawLine(this.points[7].multiplyByMatrix(this.transform), this.points[8].multiplyByMatrix(this.transform))
        drawLine(this.points[8].multiplyByMatrix(this.transform), this.points[9].multiplyByMatrix(this.transform))
        drawLine(this.points[9].multiplyByMatrix(this.transform), this.points[0].multiplyByMatrix(this.transform))
    }
}

function drawLine(p1: Point, p2: Point, color: string = "#000000") {
    var ctx = canvas.getContext("2d");
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(p1.toAbsolute().x, p1.toAbsolute().y);
    ctx.lineTo(p2.toAbsolute().x, p2.toAbsolute().y);
    ctx.stroke();
}

function drawCircle(p: Point, r: number, color: string = "#000000") {
    console.log(p);
    var ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(p.toAbsolute().x, p.toAbsolute().y);
    // ctx.stroke();
    ctx.arc(p.toAbsolute().x, p.toAbsolute().y, 5, 0, Math.PI * 2, false);
    ctx.fillStyle = color;
    ctx.fill()
}

function drawText(p1: Point, text: string, fontSize: string = "20px", color: string = "#000000") {
    var ctx = canvas.getContext("2d");
    ctx.font = fontSize + " Verdana";
    ctx.textAlign = "center";
    ctx.fillStyle = color;
    ctx.fillText(text, p1.toAbsolute().x, p1.toAbsolute().y);
}

function drawCoordinatePlane() {
    //X
    drawLine(new Point(-50, 0), new Point(50, 0))
    //Y
    drawLine(new Point(0, 50), new Point(0, -50))
    
    // X mark
    drawLine(new Point(50, 0), new Point(49, 1))
    drawLine(new Point(50, 0), new Point(49, -1))
    drawText(new Point(48, 2), "X");

    // Y mark
    drawLine(new Point(0, 50), new Point(1, 49))
    drawLine(new Point(0, 50), new Point(-1, 49))
    drawText(new Point(2, 48), "Y");

    let unitWidth = canvas.width / relativeWidth;
    let unitCountX = ((canvas.width / 2) / unitWidth);
    for (let i = 1; i < unitCountX; i++){
        drawLine(new Point(-i, -0.5), new Point(-i, 0.5));
        drawLine(new Point(i, -0.5), new Point(i, 0.5));

        if (i % 5 === 0) {
            drawText(new Point(-i, -1.5), (-i).toString(), "10px")
            drawText(new Point(i, -1.5), (i).toString(), "10px")
        }
    }

    let unitHeight = canvas.height / relativeHeight;
    let unitCountY = ((canvas.height / 2) / unitHeight);
    for (let i = 1; i < unitCountY; i++){
        drawLine(new Point(-0.5, -i), new Point(0.5, -i));
        drawLine(new Point(-0.5, i), new Point(0.5, i));

        if (i % 5 === 0) {
            drawText(new Point(-1.5, -i), (-i).toString(), "10px")
            drawText(new Point(-1.5, i), (i).toString(), "10px")
        }
    }
}

function clearCanvas() {
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// function 

function update() {
    clearCanvas();
    drawCoordinatePlane();
    // figure.update();
    figure.draw();
}

var figure: Figure;

function main() {
    drawCoordinatePlane();
    figure = new Figure(new Point(0,0));
    figure.setTransform(new Matrix3(
        [ 
            1, 0, 5,
            0, 1, 0,
            0, 0, 1
        ]
    ))
    figure.addTransform(new Matrix3(
        [ 
            1, 0, 0,
            0, 1, 10,
            0, 0, 1
        ]
    ))
    figure.draw();
   setInterval(update, 5)

   document.addEventListener('keypress', (e) => {
        let t = new Matrix3(
            [ 
                1, 0, 0,
                0, 1, 0,
                0, 0, 1
            ]
        )
        switch(e.key.toLowerCase()){
            case 'd':
                t = t.multiplyMatrices(new Matrix3([1, 0, 1, 0, 1, 0, 0, 0, 1]))
                break;
            case 'a':
                t = t.multiplyMatrices(new Matrix3([1, 0, -1, 0, 1, 0, 0, 0, 1]))
                break;
            case 'w':
                t = t.multiplyMatrices(new Matrix3([1, 0, 0, 0, 1, 1, 0, 0, 1]))
                break;
            case 's':
                t = t.multiplyMatrices(new Matrix3([1, 0, 0, 0, 1, -1, 0, 0, 1]))
                break;
        }
        if (e.ctrlKey) t = t.multiplyMatrices(new Matrix3([1, 0, 10, 0, 1, 10, 0, 0, 1]))
        figure.addTransform(t)
   })
}

document.addEventListener("DOMContentLoaded", main)