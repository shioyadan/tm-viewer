"strict";

// dom に渡されたオブジェクトにドラッグアンドドロップされたファイルを読み，
// onFileLoaded で渡された関数に内容を渡す
function initFileReader(dom, onFileLoaded) {
    function handleFileSelect(evt) {
        evt.stopPropagation();
        evt.preventDefault();

        let files = evt.dataTransfer.files; // FileList object.
        for (let f of files) {
            let reader = new FileReader();
            reader.onload = function() {
                onFileLoaded(reader.result);
            };
            reader.readAsText(f);        
        }
    }
    function handleDragOver(evt) {
        evt.stopPropagation();
        evt.preventDefault();
    }
    // ドラッグアンドロップのハンドラの設定
    dom.addEventListener("dragover", handleDragOver, false);    // これをブロックしておかないと，新しいファイルが開いてしまう
    dom.addEventListener("drop", handleFileSelect, false);
}


// id が "canvas-id" となっている canvas タグのオブジェクトを取得 
let canvas = document.querySelector("canvas#canvas-id");
let c = canvas.getContext("2d");

// 幅と高さを設定
let width = 800;
let height = 600;

// 高解像度ディスプレイでぼけるのでおまじない
let devicePixelRatio = window.devicePixelRatio || 1;
let backingStoreRatio = c.backingStorePixelRatio || 1;
let ratio = devicePixelRatio / backingStoreRatio;
canvas.width = width * ratio;
canvas.height = height * ratio;
c.scale(ratio, ratio);
canvas.style.width = `${width}px`;
canvas.style.height = `${height}px`;

// 読み出し済みデータ
let loadedData = null;

// 拡大率
let zoomRatio = 100000;

// 第一引数に指定したタグにドロップされたファイルの読み出し
function drawData(data){
    loadedData = data;  // 一回読みだしたらとっておく（手抜き）
    //console.log(data);

    // 背景を塗りつぶし
    c.fillStyle = "rgb(200,200,200)";
    c.fillRect(0, 0, width, height);

    // 改行で区切って行を取り出す
    let lines = data.split(/\n/);   

    // 各行ごとの処理
    for (let line of lines) {
        let words = line.split(/\t/);   // タブで区切る
        if (words[0] == "c") { // コミット
            c.fillStyle = "rgb(255,255,255)";   // 白
        }
        else if (words[0] == "a") { // アボート
            c.fillStyle = "rgb(0,0,0)"; // 黒
        }
        else if (words[0] == "b") { // 開始
            c.fillStyle = "rgb(200,100,100)"; // 赤
        }

        // タイムスタンプの横位置に上で指定した色を描画
        let left = words[3] * zoomRatio;    // 適当に倍率をかける
        c.fillRect(left, 0, 1, height); // 横位置，縦位置，幅，高さ で塗りつぶし
    }
}

// 第一引数に指定したタグにドロップされたファイルの読み出し
initFileReader(canvas, drawData);

// キーを押したら拡大率を変えて再描画
document.onkeydown = function(e) {
    let key = e.key;
    // 上なら拡大，それ以外なら縮小
    zoomRatio *= key == "ArrowUp" ? 1.1 : 0.9;
    drawData(loadedData);
};



// ドラッグアンドドロップするのがめんどい時は以下のように直接書いてテストしてもよい
// ただし，行頭にスペースがあると動かないので注意
// let data = `
// c	0	10
// a	1	30
// c	2	80
// `;
// drawData(data);

