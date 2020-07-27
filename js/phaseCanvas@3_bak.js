/*
 * 相位编辑控件
 * Phase(v2.0.0)
 * Copyright zws,lyq
 * 2020.01.07
 * 采用标准原生JS封装
 */
;
(function($, window, document) {
	var Phase = function(options) {
		this.oBgCanvas = null;
		this.canBgContext = null;
		this.oCanvas = null;
		this.canContext = null;
		this.drawBg = new Image();
		this.drawBg.src = 'img/PhaseShape@3.png';
		this.drawImg = new Image();
		this.drawImg.src = 'img/SignalChy-tech@3.png';
		this.arrayDraw = [];
		this.greenMap = new Map();
		this.allSignalMap = new Map();
		// 定义所有信号组显示名称
		this.signalDisp = ['1A', '1S', '1L', '1R', '1P', '11P', '12P', '2A', '2S', '2L', '2R', '2P', '21P', '22P', '3A',
			'3S', '3L', '3R', '3P', '31P', '32P', '4A', '4S', '4L', '4R', '4P', '41P', '42P'
		];
		// 定义所有信号组编号
		this.signalCode = ['001', '002', '003', '004', '007', '008', '009', '033', '034', '035', '036', '039', '040', '041',
			'065', '066', '067', '068', '071', '072', '073', '097', '098', '099', '100', '103', '104', '105'
		];

		// 判断是用函数创建的还是用new创建的。这样我们就可以通过Phase("options") 或 new Phase("options")来使用这个插件了  
		if (!(this instanceof Phase)) return new Phase(options);
		// 参数合并
		this.options = this.extend({
			crossShape: 2, //0-水平一字,1-垂直一字,2-十字,3-东T,4-西T,5-南T,6-北T
			phaseId: 0, // 相位号
			usableSignal: '1L,1S,1R,1A,2L,2S,2R,2A,3L,3S,3R,3A,4L,4S,4R,4A,11P,12P,21P,22P,31P,32P,41P,42P,1P', // 可用信号组
			greenSignal: '',
			// 绿冲突组
			clashSignal: []
		}, options)

		// 将所有信号组放入allSignalMap:["1A","001"]
		for (var i = 0; i < this.signalDisp.length; i++) {
			this.allSignalMap.set(this.signalDisp[i], this.signalCode[i]);
		}
		// 将参数转为大写
		this.options.usableSignal = this.options.usableSignal.toUpperCase();
		this.options.greenSignal = this.options.greenSignal.toUpperCase();
		// 初始化  
		this.init();
	};
	// 原型对象
	Phase.prototype = {
		// 参数覆盖
		extend: function(obj, obj2) {
			for (var k in obj2) {
				obj[k] = obj2[k];
			}
			return obj;
		},

		// 初始化
		init: function() {
			var _self = this;

			var div = document.createElement('div');
			div.style = "position: relative;width:606px;height:606px;display:inline-block;";
			// 创建背景画布
			var bgCanvas = document.createElement('canvas');
			bgCanvas.id = "canvasBg";
			bgCanvas.width = 600;
			bgCanvas.height = 600;
			bgCanvas.style = "border: 3px solid #3f5c65;position: absolute;top: 0;left: 0;";
			div.appendChild(bgCanvas);

			// 创建画布
			var pCanvas = document.createElement('canvas');
			pCanvas.id = "canvasImg";
			pCanvas.width = 600;
			pCanvas.height = 600;
			pCanvas.style = "border: 3px solid #3f5c65;position: absolute;top: 0;left: 0;";
			div.appendChild(pCanvas);

			// 创建一个提示的P标签
			var pTips = document.createElement('p');
			pTips.style =
				"position: absolute;display: none;top: 50%;left: 50%;font-size: 18px;color: #d60202;margin: 0;margin: -20px 0 0 -115px;text-align: center;line-height: 40px;padding: 0;text-shadow: 2px 2px 2px #5a0505;background: #3a3030;width: 230px;height: 45px;border: #522f07 1px solid;box-shadow: #171515 2px 2px 4px 1px;border-color: #cc0707 #840a0a #860f0f #ca1313;z-index:100;";
			div.appendChild(pTips);
			document.body.appendChild(div);

			/* 背景画布*/
			var bgid = 'canvasBg';
			_self.oBgCanvas = document.getElementById(bgid);
			if (_self.oBgCanvas == null) return;
			if (!_self.oBgCanvas.getContext) return;
			_self.canBgContext = _self.oBgCanvas.getContext("2d");
			/* 信号组画布*/
			var id = 'canvasImg';
			_self.oCanvas = document.getElementById(id);
			if (_self.oCanvas == null) return;
			if (!_self.oCanvas.getContext) return;
			_self.canContext = _self.oCanvas.getContext("2d");

			_self.drawBg.onload = () => {
				_self.drawCrossShape(); // 绘制路口形状
			};

			_self.drawImg.onload = () => {
				_self.drawSignalLight(); // 绘制信号组
			};

			this.event();
		},

		// 绘制相位ID
		drawPhaseId: function() {
			var _self = this;
			// 清空画布
			_self.canContext.clearRect(0, 0, 100, 100);
			_self.canContext.beginPath();
			// 设置弧线的颜色为蓝色
			var circle = {
				x: 50, //圆心的x轴坐标值
				y: 50, //圆心的y轴坐标值
				r: 32 //圆的半径
			};
			// 以canvas中的坐标点(50,50)为圆心，绘制一个半径为32px的圆形
			_self.canContext.arc(circle.x, circle.y, circle.r, 0, Math.PI * 2, true);
			// 线宽
			_self.canContext.lineWidth = 4;
			// 绘制相位号		
			_self.canContext.strokeStyle = "#FF0000";
			_self.canContext.fillStyle = "#00FF00";
			_self.canContext.font = "40px Arial";
			_self.canContext.textAlign = 'center';
			_self.canContext.textBaseline = 'middle'
			_self.canContext.fillText(_self.options.phaseId, circle.x, circle.y + 1);
			_self.canContext.stroke();
		},
		// 绘制路口形状
		drawCrossShape: function() {
			var _self = this;
			switch (_self.options.crossShape) {
				case 0: // 东西一字
					_self.canBgContext.drawImage(_self.drawBg, 0, 0, 600, 600, 0, 0, 600, 600);
					break;
				case 1: // 南北一字		
					_self.canBgContext.drawImage(_self.drawBg, 600, 0, 600, 600, 0, 0, 600, 600);
					break;
				case 2: // 十字
					_self.canBgContext.drawImage(_self.drawBg, 1200, 0, 600, 600, 0, 0, 600, 600);
					break;
				case 3: // 东T					
					_self.canBgContext.drawImage(_self.drawBg, 1800, 0, 600, 600, 0, 0, 600, 600);
					break;
				case 4: // 西T					
					_self.canBgContext.drawImage(_self.drawBg, 2400, 0, 600, 600, 0, 0, 600, 600);
					break;
				case 5: // 南T
					_self.canBgContext.drawImage(_self.drawBg, 3000, 0, 600, 600, 0, 0, 600, 600);
					break;
				case 6: // 北T
					_self.canBgContext.drawImage(_self.drawBg, 3600, 0, 600, 600, 0, 0, 600, 600);
					break;
			}
		},

		// 过滤传入参数中的11P,12P...
		filterData: function(arrayGroup) {
			if (arrayGroup.indexOf('1P') > -1) { // 判断参数中是否有1P
				var index_11p = arrayGroup.indexOf('11P');
				// 移除11p
				if (index_11p > -1) {
					arrayGroup.splice(index_11p, 1)
				};
				var index_12p = arrayGroup.indexOf('12P');
				// 移除12p
				if (index_12p > -1) {
					arrayGroup.splice(index_12p, 1)
				};
			}
			if (arrayGroup.indexOf('2P') > -1) { // 判断参数中是否有2P
				var index_21p = arrayGroup.indexOf('21P');
				// 移除21p
				if (index_21p > -1) {
					arrayGroup.splice(index_21p, 1)
				};
				var index_22p = arrayGroup.indexOf('22P');
				// 移除22p
				if (index_22p > -1) {
					arrayGroup.splice(index_22p, 1)
				};
			}

			if (arrayGroup.indexOf('3P') > -1) { // 判断参数中是否有2P
				var index_31p = arrayGroup.indexOf('31P');
				// 移除31p
				if (index_31p > -1) {
					arrayGroup.splice(index_31p, 1)
				};
				var index_32p = arrayGroup.indexOf('32P');
				// 移除32p
				if (index_32p > -1) {
					arrayGroup.splice(index_32p, 1)
				};
			}

			if (arrayGroup.indexOf('4P') > -1) { // 判断参数中是否有2P
				var index_41p = arrayGroup.indexOf('41P');
				// 移除41p
				if (index_41p > -1) {
					arrayGroup.splice(index_41p, 1)
				};
				var index_42p = arrayGroup.indexOf('42P');
				// 移除42p
				if (index_42p > -1) {
					arrayGroup.splice(index_42p, 1)
				};
			}
		},

		drawSignalLight: function() {
			var _self = this;
			if (_self.options.usableSignal) { // 绘制可用信号组
				var signalGroup = _self.options.usableSignal.split(',');
				_self.filterData(signalGroup); // 传入参数中同时存在11P,12P,1P时,过滤掉11P,12P...
				// 遍历
				for (var key in signalGroup) {
					switch (signalGroup[key]) {
						case "1A":
							switch (_self.options.crossShape) {
								case 2: // 十字	
									_self.canContext.drawImage(_self.drawImg, 540, 0, 54, 48, 450, 135, 54, 48);
									_self.arrayDraw.push({
										ix: 540,
										iy: 0,
										x: 450,
										y: 135,
										w: 54,
										h: 48,
										disp: '1A'
									});
									break;
							}
							break;
						case "1L":
							switch (_self.options.crossShape) {
								case 2: // 十字	
								case 3: // 南T	
								case 5: // 北T	
									_self.canContext.drawImage(_self.drawImg, 0, 0, 54, 27, 450, 255, 54, 27);
									_self.arrayDraw.push({
										ix: 0,
										iy: 0,
										x: 450,
										y: 255,
										w: 54,
										h: 27,
										disp: '1L'
									});
									break;
							}
							break;
						case "1S":
							switch (_self.options.crossShape) {
								case 0: // 东西一字	
									_self.canContext.drawImage(_self.drawImg, 60, 0, 54, 27, 203, 196, 54, 27);
									_self.arrayDraw.push({
										ix: 60,
										iy: 0,
										x: 203,
										y: 196,
										w: 54,
										h: 27,
										disp: '1S'
									});
									break;
								case 2: // 十字	
								case 5: // 南T	
								case 6: // 北T	
									_self.canContext.drawImage(_self.drawImg, 60, 0, 54, 27, 450, 225, 54, 27);
									_self.arrayDraw.push({
										ix: 60,
										iy: 0,
										x: 450,
										y: 225,
										w: 54,
										h: 27,
										disp: '1S'
									});
									break;
							}
							break;
						case "1R":
							switch (_self.options.crossShape) {
								case 2: // 十字	
								case 3: // 南T	
								case 6: // 北T	
									_self.canContext.drawImage(_self.drawImg, 120, 0, 54, 27, 450, 195, 54, 27);
									_self.arrayDraw.push({
										ix: 120,
										iy: 0,
										x: 450,
										y: 195,
										w: 54,
										h: 27,
										disp: '1R'
									});
									break;
							}
							break;
						case "2A":
							switch (_self.options.crossShape) {
								case 2: // 十字
									_self.canContext.drawImage(_self.drawImg, 600, 0, 54, 48, 96, 417, 54, 48);
									_self.arrayDraw.push({
										ix: 600,
										iy: 0,
										x: 96,
										y: 417,
										w: 54,
										h: 48,
										disp: '2A'
									});
									break;
							}
							break;
						case "2L":
							switch (_self.options.crossShape) {
								case 2: // 十字	
								case 4: // 南T	
								case 6: // 北T	
									_self.canContext.drawImage(_self.drawImg, 300, 0, 54, 27, 96, 318, 54, 27);
									_self.arrayDraw.push({
										ix: 300,
										iy: 0,
										x: 96,
										y: 318,
										w: 54,
										h: 27,
										disp: '2L'
									});
									break;
							}
							break;
						case "2S":
							switch (_self.options.crossShape) {
								case 0: // 东西一字	
									_self.canContext.drawImage(_self.drawImg, 240, 0, 54, 27, 370, 350, 54, 27);
									_self.arrayDraw.push({
										ix: 240,
										iy: 0,
										x: 370,
										y: 350,
										w: 54,
										h: 27,
										disp: '2S'
									});
									break;
								case 2: // 十字	
								case 5: // 南T	
								case 6: // 北T	
									_self.canContext.drawImage(_self.drawImg, 240, 0, 54, 27, 96, 348, 54, 27);
									_self.arrayDraw.push({
										ix: 240,
										iy: 0,
										x: 96,
										y: 348,
										w: 54,
										h: 27,
										disp: '2S'
									});
									break;
							}
							break;
						case "2R":
							switch (_self.options.crossShape) {
								case 2: // 十字	
								case 4: // 南T	
								case 5: // 北T	
									_self.canContext.drawImage(_self.drawImg, 180, 0, 54, 27, 96, 378, 54, 27);
									_self.arrayDraw.push({
										ix: 180,
										iy: 0,
										x: 96,
										y: 378,
										w: 54,
										h: 27,
										disp: '2R'
									});
									break;
							}
							break;
						case "3A":
							switch (_self.options.crossShape) {
								case 2: // 十字	
									_self.canContext.drawImage(_self.drawImg, 660, 0, 48, 54, 417, 450, 48, 54);
									_self.arrayDraw.push({
										ix: 660,
										iy: 0,
										x: 417,
										y: 450,
										w: 48,
										h: 54,
										disp: '3A'
									});
									break;
							}
							break;
						case "3L":
							switch (_self.options.crossShape) {
								case 2: // 十字	
								case 4: // 南T	
								case 5: // 北T	
									_self.canContext.drawImage(_self.drawImg, 360, 0, 27, 54, 318, 450, 27, 54);
									_self.arrayDraw.push({
										ix: 360,
										iy: 0,
										x: 318,
										y: 450,
										w: 27,
										h: 54,
										disp: '3L'
									});
									break;
							}
							break;
						case "3S":
							switch (_self.options.crossShape) {
								case 1: // 南北一字	
									_self.canContext.drawImage(_self.drawImg, 390, 0, 27, 54, 370, 186, 27, 54);
									_self.arrayDraw.push({
										ix: 390,
										iy: 0,
										x: 370,
										y: 186,
										w: 27,
										h: 54,
										disp: '3S'
									});
									break;
								case 2: // 十字	
								case 3: // 东T	
								case 4: // 西T	
									_self.canContext.drawImage(_self.drawImg, 390, 0, 27, 54, 348, 450, 27, 54);
									_self.arrayDraw.push({
										ix: 390,
										iy: 0,
										x: 348,
										y: 450,
										w: 27,
										h: 54,
										disp: '3S'
									});
									break;
							}
							break;
						case "3R":
							switch (_self.options.crossShape) {
								case 2: // 十字	
								case 3: // 南T	
								case 5: // 北T	
									_self.canContext.drawImage(_self.drawImg, 420, 0, 27, 54, 378, 450, 27, 54);
									_self.arrayDraw.push({
										ix: 420,
										iy: 0,
										x: 378,
										y: 450,
										w: 27,
										h: 54,
										disp: '3R'
									});
									break;
							}
							break;
						case "4A":
							switch (_self.options.crossShape) {
								case 2: // 十字	
									_self.canContext.drawImage(_self.drawImg, 720, 0, 48, 54, 135, 96, 48, 54);
									_self.arrayDraw.push({
										ix: 720,
										iy: 0,
										x: 135,
										y: 96,
										w: 48,
										h: 54,
										disp: '4A'
									});
									break;
							}
							break;
						case "4L":
							switch (_self.options.crossShape) {
								case 2: // 十字	
								case 3: // 南T	
								case 6: // 北T	
									_self.canContext.drawImage(_self.drawImg, 510, 0, 27, 54, 255, 96, 27, 54);
									_self.arrayDraw.push({
										ix: 510,
										iy: 0,
										x: 255,
										y: 96,
										w: 27,
										h: 54,
										disp: '4L'
									});
									break;
							}
							break;
						case "4S":
							switch (_self.options.crossShape) {
								case 1: // 南北一字	
									_self.canContext.drawImage(_self.drawImg, 480, 0, 27, 54, 203, 350, 27, 54);
									_self.arrayDraw.push({
										ix: 480,
										iy: 0,
										x: 203,
										y: 350,
										w: 27,
										h: 54,
										disp: '4S'
									});
									break;
								case 2: // 十字	
								case 3: // 东T	
								case 4: // 西T	
									_self.canContext.drawImage(_self.drawImg, 480, 0, 27, 54, 225, 96, 27, 54);
									_self.arrayDraw.push({
										ix: 480,
										iy: 0,
										x: 225,
										y: 96,
										w: 27,
										h: 54,
										disp: '4S'
									});
									break;
							}
							break;
						case "4R":
							switch (_self.options.crossShape) {
								case 2: // 十字	
								case 4: // 南T	
								case 6: // 北T	
									_self.canContext.drawImage(_self.drawImg, 450, 0, 27, 54, 195, 96, 27, 54);
									_self.arrayDraw.push({
										ix: 450,
										iy: 0,
										x: 195,
										y: 96,
										w: 27,
										h: 54,
										disp: '4R'
									});
									break;
							}
							break;
						case "1P":
							switch (_self.options.crossShape) {
								case 0: // 东西一字	
									_self.canContext.drawImage(_self.drawImg, 810, 0, 18, 336, 291, 132, 18, 336);
									_self.arrayDraw.push({
										ix: 810,
										iy: 0,
										x: 291,
										y: 132,
										w: 18,
										h: 336,
										disp: '1P'
									});
									break;
								case 2: // 十字	
								case 3: // 东T	
								case 5: // 南T	
								case 6: // 北T	
									_self.canContext.drawImage(_self.drawImg, 810, 0, 18, 336, 528, 132, 18, 336);
									_self.arrayDraw.push({
										ix: 810,
										iy: 0,
										x: 528,
										y: 132,
										w: 18,
										h: 336,
										disp: '1P'
									});
									break;
							}
							break;
						case "2P":
							switch (_self.options.crossShape) {
								case 2: // 十字	
								case 4: // 西T	
								case 5: // 南T	
								case 6: // 北T
									_self.canContext.drawImage(_self.drawImg, 810, 0, 18, 336, 54, 132, 18, 336);
									_self.arrayDraw.push({
										ix: 810,
										iy: 0,
										x: 54,
										y: 132,
										w: 18,
										h: 336,
										disp: '2P'
									});
									break;
							}
							break;
						case "3P":
							switch (_self.options.crossShape) {
								case 1: // 南北一字	
									_self.canContext.drawImage(_self.drawImg, 0, 60, 336, 18, 132, 291, 336, 18);
									_self.arrayDraw.push({
										ix: 0,
										iy: 60,
										x: 132,
										y: 291,
										w: 336,
										h: 18,
										disp: '3P'
									});
									break;
								case 2: // 十字	
								case 3: // 东T	
								case 4: // 西T	
								case 5: // 南T	
									_self.canContext.drawImage(_self.drawImg, 0, 60, 336, 18, 132, 528, 336, 18);
									_self.arrayDraw.push({
										ix: 0,
										iy: 60,
										x: 132,
										y: 528,
										w: 336,
										h: 18,
										disp: '3P'
									});
									break;
							}
							break;
						case "4P":
							switch (_self.options.crossShape) {
								case 2: // 十字	
								case 3: // 东T	
								case 4: // 西T	
								case 6: // 北T	
									_self.canContext.drawImage(_self.drawImg, 0, 60, 336, 18, 132, 54, 336, 18);
									_self.arrayDraw.push({
										ix: 0,
										iy: 60,
										x: 132,
										y: 54,
										w: 336,
										h: 18,
										disp: '4P'
									});
									break;
							}
							break
						case "11P":
							switch (_self.options.crossShape) {
								case 0: // 东西一字	
									_self.canContext.drawImage(_self.drawImg, 780, 0, 18, 156, 291, 132, 18, 156);
									_self.arrayDraw.push({
										ix: 780,
										iy: 0,
										x: 291,
										y: 132,
										w: 18,
										h: 156,
										disp: '11P'
									});
									break;
								case 2: // 十字	
								case 3: // 东T	
								case 5: // 南T	
								case 6: // 北T	
									_self.canContext.drawImage(_self.drawImg, 780, 0, 18, 156, 528, 132, 18, 156);
									_self.arrayDraw.push({
										ix: 780,
										iy: 0,
										x: 528,
										y: 132,
										w: 18,
										h: 156,
										disp: '11P'
									});
									break;
							}
							break;
						case "12P":
							switch (_self.options.crossShape) {
								case 0: // 东西一字	
									_self.canContext.drawImage(_self.drawImg, 780, 0, 18, 156, 291, 312, 18, 156);
									_self.arrayDraw.push({
										ix: 780,
										iy: 0,
										x: 291,
										y: 312,
										w: 18,
										h: 156,
										disp: '12P'
									});
									break;
								case 2: // 十字	
								case 3: // 东T	
								case 5: // 南T	
								case 6: // 北T	
									_self.canContext.drawImage(_self.drawImg, 780, 0, 18, 156, 528, 312, 18, 156);
									_self.arrayDraw.push({
										ix: 780,
										iy: 0,
										x: 528,
										y: 312,
										w: 18,
										h: 156,
										disp: '12P'
									});
									break;
							}
							break;
						case "21P":
							switch (_self.options.crossShape) {
								case 2: // 十字	
								case 4: // 西T	
								case 5: // 南T	
								case 6: // 北T	
									_self.canContext.drawImage(_self.drawImg, 780, 0, 18, 156, 54, 312, 18, 156);
									_self.arrayDraw.push({
										ix: 780,
										iy: 0,
										x: 54,
										y: 312,
										w: 18,
										h: 156,
										disp: '21P'
									});
									break;
							}
							break;
						case "22P":
							switch (_self.options.crossShape) {
								case 2: // 十字	
								case 4: // 西T	
								case 5: // 南T	
								case 6: // 北T	
									_self.canContext.drawImage(_self.drawImg, 780, 0, 18, 156, 54, 132, 18, 156);
									_self.arrayDraw.push({
										ix: 780,
										iy: 0,
										x: 54,
										y: 132,
										w: 18,
										h: 156,
										disp: '22P'
									});
									break;
							}
							break;
						case "31P":
							switch (_self.options.crossShape) {
								case 1: // 南北一字	
									_self.canContext.drawImage(_self.drawImg, 0, 90, 156, 18, 312, 291, 156, 18);
									_self.arrayDraw.push({
										ix: 0,
										iy: 90,
										x: 312,
										y: 291,
										w: 156,
										h: 18,
										disp: '31P'
									});
									break;
								case 2: // 十字	
								case 3: // 东T	
								case 4: // 西T	
								case 5: // 南T	
									_self.canContext.drawImage(_self.drawImg, 0, 90, 156, 18, 312, 528, 156, 18);
									_self.arrayDraw.push({
										ix: 0,
										iy: 90,
										x: 312,
										y: 528,
										w: 156,
										h: 18,
										disp: '31P'
									});
									break;
							}
							break;
						case "32P":
							switch (_self.options.crossShape) {
								case 1: // 南北一字	
									_self.canContext.drawImage(_self.drawImg, 0, 90, 156, 18, 132, 291, 156, 18);
									_self.arrayDraw.push({
										ix: 0,
										iy: 90,
										x: 132,
										y: 291,
										w: 156,
										h: 18,
										disp: '32P'
									});
									break;
								case 2: // 十字	
								case 3: // 东T	
								case 4: // 西T	
								case 5: // 南T	
									_self.canContext.drawImage(_self.drawImg, 0, 90, 156, 18, 132, 528, 156, 18);
									_self.arrayDraw.push({
										ix: 0,
										iy: 90,
										x: 132,
										y: 528,
										w: 156,
										h: 18,
										disp: '32P'
									});
									break;
							}
							break;
						case "41P":
							switch (_self.options.crossShape) {
								case 2: // 十字	
								case 3: // 东T	
								case 4: // 西T	
								case 6: // 北T	
									_self.canContext.drawImage(_self.drawImg, 0, 90, 156, 18, 132, 54, 156, 18);
									_self.arrayDraw.push({
										ix: 0,
										iy: 90,
										x: 132,
										y: 54,
										w: 156,
										h: 18,
										disp: '41P'
									});
									break;
							}
							break;
						case "42P":
							switch (_self.options.crossShape) {
								case 2: // 十字	
								case 3: // 东T	
								case 4: // 西T	
								case 6: // 北T	
									_self.canContext.drawImage(_self.drawImg, 0, 90, 156, 18, 312, 54, 156, 18);
									_self.arrayDraw.push({
										ix: 0,
										iy: 90,
										x: 312,
										y: 54,
										w: 156,
										h: 18,
										disp: '42P'
									});
									break;
							}
							break;
					}
				}
			}

			if (_self.options.greenSignal) { // 绘制绿灯信号组
				var greenGroup = _self.options.greenSignal.split(',');
				_self.filterData(greenGroup); // 传入参数中同时存在11P,12P,1P时,过滤掉11P,12P...				
				for (var key in greenGroup) {
					// 将绿灯信号组加入greenMap
					_self.greenMap.set(greenGroup[key], _self.allSignalMap.get(greenGroup[key]));
					switch (greenGroup[key]) {
						case "1A":
							switch (_self.options.crossShape) {
								case 2: // 十字	
									_self.canContext.drawImage(_self.drawImg, 540, 600, 54, 48, 450, 135, 54, 48);
									// 将热点区域中对应的对象iy值换成600(即代表亮灯)
									_self.arrayDraw = _self.arrayDraw.map(t => {
										if (t.disp === '1A') {
											t.iy = 600;
										}
										return t;
									});
									break;
							}
							break;
						case "1L":
							switch (_self.options.crossShape) {
								case 2: // 十字	
								case 3: // 南T	
								case 5: // 北T	
									_self.canContext.drawImage(_self.drawImg, 0, 600, 54, 27, 450, 255, 54, 27);
									// 将热点区域中对应的对象iy值换成600(即代表亮灯)
									_self.arrayDraw = _self.arrayDraw.map(t => {
										if (t.disp === '1L') {
											t.iy = 600;
										}
										return t;
									});
									break;
							}
							break;
						case "1S":
							switch (_self.options.crossShape) {
								case 0: // 东西一字	
									_self.canContext.drawImage(_self.drawImg, 60, 600, 54, 27, 203, 196, 54, 27);
									// 将热点区域中对应的对象iy值换成600(即代表亮灯)
									_self.arrayDraw = _self.arrayDraw.map(t => {
										if (t.disp === '1S') {
											t.iy = 600;
										}
										return t;
									});
									break;
								case 1: // 南北一字	
									break;
								case 2: // 十字	
								case 5: // 南T	
								case 6: // 北T	
									_self.canContext.drawImage(_self.drawImg, 60, 600, 54, 27, 450, 225, 54, 27);
									// 将热点区域中对应的对象iy值换成600(即代表亮灯)
									_self.arrayDraw = _self.arrayDraw.map(t => {
										if (t.disp === '1S') {
											t.iy = 600;
										}
										return t;
									});
									break;
							}
							break;
						case "1R":
							switch (_self.options.crossShape) {
								case 2: // 十字	
								case 3: // 南T	
								case 6: // 北T	
									_self.canContext.drawImage(_self.drawImg, 120, 600, 54, 27, 450, 195, 54, 27);
									// 将热点区域中对应的对象iy值换成600(即代表亮灯)
									_self.arrayDraw = _self.arrayDraw.map(t => {
										if (t.disp === '1R') {
											t.iy = 600;
										}
										return t;
									});
									break;
							}
							break;
						case "2A":
							switch (_self.options.crossShape) {
								case 2: // 十字	
									_self.canContext.drawImage(_self.drawImg, 600, 600, 54, 48, 96, 417, 54, 48);
									// 将热点区域中对应的对象iy值换成600(即代表亮灯)
									_self.arrayDraw = _self.arrayDraw.map(t => {
										if (t.disp === '2A') {
											t.iy = 600;
										}
										return t;
									});
									break;
							}
							break;
						case "2L":
							switch (_self.options.crossShape) {
								case 2: // 十字	
								case 4: // 南T	
								case 6: // 北T	
									_self.canContext.drawImage(_self.drawImg, 300, 600, 54, 27, 96, 318, 54, 27);
									// 将热点区域中对应的对象iy值换成600(即代表亮灯)
									_self.arrayDraw = _self.arrayDraw.map(t => {
										if (t.disp === '2L') {
											t.iy = 600;
										}
										return t;
									});
									break;
							}
							break;
						case "2S":
							switch (_self.options.crossShape) {
								case 0: // 东西一字	
									_self.canContext.drawImage(_self.drawImg, 240, 600, 54, 27, 370, 350, 54, 27);
									// 将热点区域中对应的对象iy值换成600(即代表亮灯)
									_self.arrayDraw = _self.arrayDraw.map(t => {
										if (t.disp === '2S') {
											t.iy = 600;
										}
										return t;
									});
									break;
								case 2: // 十字	
								case 5: // 南T	
								case 6: // 北T	
									_self.canContext.drawImage(_self.drawImg, 240, 600, 54, 27, 96, 348, 54, 27);
									// 将热点区域中对应的对象iy值换成600(即代表亮灯)
									_self.arrayDraw = _self.arrayDraw.map(t => {
										if (t.disp === '2S') {
											t.iy = 600;
										}
										return t;
									});
									break;
							}
							break;
						case "2R":
							switch (_self.options.crossShape) {
								case 2: // 十字	
								case 4: // 南T	
								case 5: // 北T	
									_self.canContext.drawImage(_self.drawImg, 180, 600, 54, 27, 96, 378, 54, 27);
									// 将热点区域中对应的对象iy值换成600(即代表亮灯)
									_self.arrayDraw = _self.arrayDraw.map(t => {
										if (t.disp === '2R') {
											t.iy = 600;
										}
										return t;
									});
									break;
							}
							break;
						case "3A":
							switch (_self.options.crossShape) {
								case 2: // 十字	
									_self.canContext.drawImage(_self.drawImg, 660, 600, 48, 54, 417, 450, 48, 54);
									// 将热点区域中对应的对象iy值换成600(即代表亮灯)
									_self.arrayDraw = _self.arrayDraw.map(t => {
										if (t.disp === '3A') {
											t.iy = 600;
										}
										return t;
									});
									break;
							}
							break;
						case "3L":
							switch (_self.options.crossShape) {
								case 2: // 十字	
								case 4: // 南T	
								case 5: // 北T	
									_self.canContext.drawImage(_self.drawImg, 360, 600, 27, 54, 318, 450, 27, 54);
									// 将热点区域中对应的对象iy值换成600(即代表亮灯)
									_self.arrayDraw = _self.arrayDraw.map(t => {
										if (t.disp === '3L') {
											t.iy = 600;
										}
										return t;
									});
									break;
							}
							break;
						case "3S":
							switch (_self.options.crossShape) {
								case 1: // 南北一字	
									_self.canContext.drawImage(_self.drawImg, 390, 600, 27, 54, 370, 186, 27, 54);
									// 将热点区域中对应的对象iy值换成600(即代表亮灯)
									_self.arrayDraw = _self.arrayDraw.map(t => {
										if (t.disp === '3S') {
											t.iy = 600;
										}
										return t;
									});
									break;
								case 2: // 十字	
								case 3: // 东T	
								case 4: // 西T	
									_self.canContext.drawImage(_self.drawImg, 390, 600, 27, 54, 348, 450, 27, 54);
									// 将热点区域中对应的对象iy值换成600(即代表亮灯)
									_self.arrayDraw = _self.arrayDraw.map(t => {
										if (t.disp === '3S') {
											t.iy = 600;
										}
										return t;
									});
									break;
							}
							break;
						case "3R":
							switch (_self.options.crossShape) {
								case 2: // 十字	
								case 3: // 南T	
								case 5: // 北T	
									_self.canContext.drawImage(_self.drawImg, 420, 600, 27, 54, 378, 450, 27, 54);
									// 将热点区域中对应的对象iy值换成600(即代表亮灯)
									_self.arrayDraw = _self.arrayDraw.map(t => {
										if (t.disp === '3R') {
											t.iy = 600;
										}
										return t;
									});
									break;
							}
							break;
						case "4A":
							switch (_self.options.crossShape) {
								case 2: // 十字	
									_self.canContext.drawImage(_self.drawImg, 720, 600, 48, 54, 135, 96, 48, 54);
									// 将热点区域中对应的对象iy值换成600(即代表亮灯)
									_self.arrayDraw = _self.arrayDraw.map(t => {
										if (t.disp === '4A') {
											t.iy = 600;
										}
										return t;
									});
									break;
							}
							break;
						case "4L":
							switch (_self.options.crossShape) {
								case 2: // 十字	
								case 3: // 南T	
								case 6: // 北T	
									_self.canContext.drawImage(_self.drawImg, 510, 600, 27, 54, 255, 96, 27, 54);
									// 将热点区域中对应的对象iy值换成600(即代表亮灯)
									_self.arrayDraw = _self.arrayDraw.map(t => {
										if (t.disp === '4L') {
											t.iy = 600;
										}
										return t;
									});
									break;
							}
							break;
						case "4S":
							switch (_self.options.crossShape) {
								case 1: // 南北一字	
									_self.canContext.drawImage(_self.drawImg, 480, 600, 27, 54, 203, 350, 27, 54);
									// 将热点区域中对应的对象iy值换成600(即代表亮灯)
									_self.arrayDraw = _self.arrayDraw.map(t => {
										if (t.disp === '4S') {
											t.iy = 600;
										}
										return t;
									});
									break;
								case 2: // 十字	
								case 3: // 东T	
								case 4: // 西T	
									_self.canContext.drawImage(_self.drawImg, 480, 600, 27, 54, 225, 96, 27, 54);
									// 将热点区域中对应的对象iy值换成600(即代表亮灯)
									_self.arrayDraw = _self.arrayDraw.map(t => {
										if (t.disp === '4S') {
											t.iy = 600;
										}
										return t;
									});
									break;
							}
							break;
						case "4R":
							switch (_self.options.crossShape) {
								case 2: // 十字	
								case 4: // 南T	
								case 6: // 北T	
									_self.canContext.drawImage(_self.drawImg, 450, 600, 27, 54, 195, 96, 27, 54);
									// 将热点区域中对应的对象iy值换成600(即代表亮灯)
									_self.arrayDraw = _self.arrayDraw.map(t => {
										if (t.disp === '4R') {
											t.iy = 600;
										}
										return t;
									});
									break;
							}
							break;
						case "1P":
							switch (_self.options.crossShape) {
								case 0: // 东西一字	
									_self.canContext.drawImage(_self.drawImg, 810, 600, 18, 336, 291, 132, 18, 336);
									// 将热点区域中对应的对象iy值换成600(即代表亮灯)
									_self.arrayDraw = _self.arrayDraw.map(t => {
										if (t.disp === '1P') {
											t.iy = 600;
										}
										return t;
									});
									break;
								case 2: // 十字	
								case 3: // 东T	
								case 5: // 南T	
								case 6: // 北T	
									_self.canContext.drawImage(_self.drawImg, 810, 600, 18, 336, 528, 132, 18, 336);
									// 将热点区域中对应的对象iy值换成600(即代表亮灯)
									_self.arrayDraw = _self.arrayDraw.map(t => {
										if (t.disp === '1P') {
											t.iy = 600;
										}
										return t;
									});
									break;
							}
							break;
						case "2P":
							switch (_self.options.crossShape) {
								case 2: // 十字	
								case 4: // 西T	
								case 5: // 南T	
								case 6: // 北T	
									_self.canContext.drawImage(_self.drawImg, 810, 600, 18, 336, 54, 132, 18, 336);
									// 将热点区域中对应的对象iy值换成600(即代表亮灯)
									_self.arrayDraw = _self.arrayDraw.map(t => {
										if (t.disp === '2P') {
											t.iy = 600;
										}
										return t;
									});
									break;
							}
							break;
						case "3P":
							switch (_self.options.crossShape) {
								case 1: // 南北一字	
									_self.canContext.drawImage(_self.drawImg, 0, 660, 336, 18, 132, 291, 336, 18);
									// 将热点区域中对应的对象iy值换成600(即代表亮灯)
									_self.arrayDraw = _self.arrayDraw.map(t => {
										if (t.disp === '3P') {
											t.iy = 600;
										}
										return t;
									});
									break;
								case 2: // 十字	
								case 3: // 东T	
								case 4: // 西T	
								case 5: // 南T	
									_self.canContext.drawImage(_self.drawImg, 0, 660, 336, 18, 132, 528, 336, 18);
									// 将热点区域中对应的对象iy值换成600(即代表亮灯)
									_self.arrayDraw = _self.arrayDraw.map(t => {
										if (t.disp === '3P') {
											t.iy = 600;
										}
										return t;
									});
									break;
							}
							break;
						case "4P":
							switch (_self.options.crossShape) {
								case 2: // 十字	
								case 3: // 东T	
								case 4: // 西T	
								case 6: // 北T	
									_self.canContext.drawImage(_self.drawImg, 0, 660, 336, 18, 132, 54, 336, 18);
									// 将热点区域中对应的对象iy值换成600(即代表亮灯)
									_self.arrayDraw = _self.arrayDraw.map(t => {
										if (t.disp === '4P') {
											t.iy = 600;
										}
										return t;
									});
									break;
							}
							break
						case "11P":
							switch (_self.options.crossShape) {
								case 0: // 东西一字	
									_self.canContext.drawImage(_self.drawImg, 780, 600, 18, 156, 291, 132, 18, 156);
									// 将热点区域中对应的对象iy值换成600(即代表亮灯)
									_self.arrayDraw = _self.arrayDraw.map(t => {
										if (t.disp === '11P') {
											t.iy = 600;
										}
										return t;
									});
									break;
								case 2: // 十字	
								case 3: // 东T	
								case 5: // 南T	
								case 6: // 北T	
									_self.canContext.drawImage(_self.drawImg, 780, 600, 18, 156, 528, 132, 18, 156);
									// 将热点区域中对应的对象iy值换成600(即代表亮灯)
									_self.arrayDraw = _self.arrayDraw.map(t => {
										if (t.disp === '11P') {
											t.iy = 600;
										}
										return t;
									});
									break;
							}
							break;
						case "12P":
							switch (_self.options.crossShape) {
								case 0: // 东西一字	
									_self.canContext.drawImage(_self.drawImg, 780, 600, 18, 156, 291, 312, 18, 156);
									// 将热点区域中对应的对象iy值换成600(即代表亮灯)
									_self.arrayDraw = _self.arrayDraw.map(t => {
										if (t.disp === '12P') {
											t.iy = 600;
										}
										return t;
									});
									break;
								case 2: // 十字	
								case 3: // 东T	
								case 5: // 南T	
								case 6: // 北T	
									_self.canContext.drawImage(_self.drawImg, 780, 600, 18, 156, 528, 312, 18, 156);
									// 将热点区域中对应的对象iy值换成600(即代表亮灯)
									_self.arrayDraw = _self.arrayDraw.map(t => {
										if (t.disp === '12P') {
											t.iy = 600;
										}
										return t;
									});
									break;
							}
							break;
						case "21P":
							switch (_self.options.crossShape) {
								case 2: // 十字	
								case 4: // 西T	
								case 5: // 南T	
								case 6: // 北T	
									_self.canContext.drawImage(_self.drawImg, 780, 600, 18, 156, 54, 312, 18, 156);
									// 将热点区域中对应的对象iy值换成600(即代表亮灯)
									_self.arrayDraw = _self.arrayDraw.map(t => {
										if (t.disp === '21P') {
											t.iy = 600;
										}
										return t;
									});
									break;
							}
							break;
						case "22P":
							switch (_self.options.crossShape) {
								case 2: // 十字	
								case 4: // 西T	
								case 5: // 南T	
								case 6: // 北T	
									_self.canContext.drawImage(_self.drawImg, 780, 600, 18, 156, 54, 132, 18, 156);
									// 将热点区域中对应的对象iy值换成600(即代表亮灯)
									_self.arrayDraw = _self.arrayDraw.map(t => {
										if (t.disp === '22P') {
											t.iy = 600;
										}
										return t;
									});
									break;
							}
							break;
						case "31P":
							switch (_self.options.crossShape) {
								case 1: // 南北一字	
									_self.canContext.drawImage(_self.drawImg, 0, 690, 156, 18, 312, 291, 156, 18);
									// 将热点区域中对应的对象iy值换成600(即代表亮灯)
									_self.arrayDraw = _self.arrayDraw.map(t => {
										if (t.disp === '31P') {
											t.iy = 600;
										}
										return t;
									});
									break;
								case 2: // 十字	
								case 3: // 东T	
								case 4: // 西T	
								case 5: // 南T	
									_self.canContext.drawImage(_self.drawImg, 0, 690, 156, 18, 312, 528, 156, 18);
									// 将热点区域中对应的对象iy值换成600(即代表亮灯)
									_self.arrayDraw = _self.arrayDraw.map(t => {
										if (t.disp === '31P') {
											t.iy = 600;
										}
										return t;
									});
									break;
							}
							break;
						case "32P":
							switch (_self.options.crossShape) {
								case 1: // 南北一字	
									_self.canContext.drawImage(_self.drawImg, 0, 690, 156, 18, 132, 291, 156, 18);
									// 将热点区域中对应的对象iy值换成600(即代表亮灯)
									_self.arrayDraw = _self.arrayDraw.map(t => {
										if (t.disp === '32P') {
											t.iy = 600;
										}
										return t;
									});
									break;
								case 2: // 十字	
								case 3: // 东T	
								case 4: // 西T	
								case 5: // 南T	
									_self.canContext.drawImage(_self.drawImg, 0, 690, 156, 18, 132, 528, 156, 18);
									// 将热点区域中对应的对象iy值换成600(即代表亮灯)
									_self.arrayDraw = _self.arrayDraw.map(t => {
										if (t.disp === '32P') {
											t.iy = 600;
										}
										return t;
									});
									break;
							}
							break;
						case "41P":
							switch (_self.options.crossShape) {
								case 2: // 十字	
								case 3: // 东T	
								case 4: // 西T	
								case 6: // 北T	
									_self.canContext.drawImage(_self.drawImg, 0, 690, 156, 18, 132, 54, 156, 18);
									// 将热点区域中对应的对象iy值换成600(即代表亮灯)
									_self.arrayDraw = _self.arrayDraw.map(t => {
										if (t.disp === '41P') {
											t.iy = 600;
										}
										return t;
									});
									break;
							}
							break;
						case "42P":
							switch (_self.options.crossShape) {
								case 2: // 十字	
								case 3: // 东T	
								case 4: // 西T	
								case 6: // 北T	
									_self.canContext.drawImage(_self.drawImg, 0, 690, 156, 18, 312, 54, 156, 18);
									// 将热点区域中对应的对象iy值换成600(即代表亮灯)
									_self.arrayDraw = _self.arrayDraw.map(t => {
										if (t.disp === '42P') {
											t.iy = 600;
										}
										return t;
									});
									break;
							}
							break;
					}
				}
			}
		},
		// 获取鼠标相对于画布的坐标
		getEventPosition: function(ev) {
			var x, y;
			if (ev.layerX || ev.layerX == 0) {
				x = ev.layerX;
				y = ev.layerY;
			} else if (ev.offsetX || ev.offsetX == 0) { // Opera  
				x = ev.offsetX;
				y = ev.offsetY;
			}
			return {
				x: x,
				y: y
			};
		},
		// event
		event: function() {
			var _self = this;
			_self.oCanvas.addEventListener('dblclick', function(e) {
				p = _self.getEventPosition(e);
				for (var i = 0; i < _self.arrayDraw.length; i++) {
					// 绘制透明的热点区域
					_self.canContext.fillStyle = 'rgba(255, 255, 255, 0)';
					_self.canContext.beginPath();
					_self.canContext.rect(_self.arrayDraw[i].x, _self.arrayDraw[i].y, _self.arrayDraw[i].w, _self.arrayDraw[i].h);
					_self.canContext.fill();

					if (p && _self.canContext.isPointInPath(p.x, p.y)) { // 判断鼠标位置是否属于热点区域
						// 清空画布
						_self.canContext.clearRect(_self.arrayDraw[i].x, _self.arrayDraw[i].y, _self.arrayDraw[i].w, _self.arrayDraw[
							i].h);
						if (_self.arrayDraw[i].iy < 100) { // 亮灯
							var clashSignal;
							_self.options.clashSignal.map(t => {
								if (t.sKey === _self.arrayDraw[i].disp) {									
									clashSignal = t.sValue; //从参数中取出与当前点击的信号组冲突的信号组串
								}
							});
							
							var isClash = false;//是否冲突
							var clashDisp = '';
							if (clashSignal) {
								var cs = clashSignal.split(','); // 将冲突字串转换为数组
								for (var m = 0; m < cs.length; m++) { // 循环数组
									_self.arrayDraw.map(t => {
										if (t.disp == cs[m]) {
											if (t.iy > 100) { // 判断冲突信号组是否点亮
												isClash = true;
												clashDisp = t.disp;
												return;
											}
										}
									});
								}
							}
							if (!isClash) { // 不冲突
								// 绘点亮信号组
								_self.canContext.drawImage(_self.drawImg, _self.arrayDraw[i].ix, _self.arrayDraw[i].iy + 600, _self.arrayDraw[
										i].w, _self.arrayDraw[i].h, _self.arrayDraw[i].x,
									_self.arrayDraw[i].y, _self.arrayDraw[i].w, _self.arrayDraw[i].h);
								_self.arrayDraw[i].iy = _self.arrayDraw[i].iy + 600;
								// 将点了的灯组加入_self.greenMap					
								_self.greenMap.set(_self.arrayDraw[i].disp, _self.allSignalMap.get(_self.arrayDraw[i].disp));
							} else {	
								// 提示冲突
								$("#canvasImg+p").html("与信号灯组【" + clashDisp + "】冲突")
								$("#canvasImg+p").stop().fadeIn(20).delay(700).fadeOut(500);
								// 重绘可用信号组
								_self.canContext.drawImage(_self.drawImg, _self.arrayDraw[i].ix, _self.arrayDraw[i].iy, _self.arrayDraw[
										i].w, _self.arrayDraw[i].h, _self.arrayDraw[i].x,
									_self.arrayDraw[i].y, _self.arrayDraw[i].w, _self.arrayDraw[i].h);
							}
						} else { // 灭灯
							_self.canContext.drawImage(_self.drawImg, _self.arrayDraw[i].ix, _self.arrayDraw[i].iy - 600, _self.arrayDraw[
									i].w, _self.arrayDraw[i].h, _self.arrayDraw[i].x,
								_self.arrayDraw[i].y, _self.arrayDraw[i].w, _self.arrayDraw[i].h);
							_self.arrayDraw[i].iy = _self.arrayDraw[i].iy - 600;
							// 将灭灯的灯组从_self.greenMap移除
							_self.greenMap.delete(_self.arrayDraw[i].disp);
						}
					}
				}
			}, false);
		},
	};
	window.PhaseCtr = Phase;
}(jQuery, window, document));
