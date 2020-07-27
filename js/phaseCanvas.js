/*
 * 相位展示控件
 * Phase(v2.0.0)
 * Copyright zws,lyq
 * 2020.01.06
 * 采用标准原生JS封装
 */
;
(function($,window, document) {
	var Phase = function(options) {
		this.oCanvas = null;
		this.canContext = null;
		this.drawBg = new Image();
		this.drawBg.src = 'img/PhaseShape.png';
		this.drawImg = new Image();
		this.drawImg.src = 'img/SignalChy-tech.png';

		// 判断是用函数创建的还是用new创建的。这样我们就可以通过Phase("options") 或 new Phase("options")来使用这个插件了  
		if (!(this instanceof Phase)) return new Phase(options);
		// 参数合并
		this.options = this.extend({
			phaseIndex: 0, //索引
			crossShape: 2, //0-水平一字,1-垂直一字,2-十字,3-东T,4-西T,5-南T,6-北T
			phaseId: 0, // 相位号
			usableSignal: '1L,1S,1R,1A,2L,2S,2R,2A,3L,3S,3R,3A,4L,4S,4R,4A,11P,12P,21P,22P,31P,32P,41P,42P', // 可用信号组
			greenSignal: ''
		}, options);

		// 将参数转为大写
		this.options.usableSignal = this.options.usableSignal.toUpperCase();
		this.options.greenSignal = this.options.greenSignal.toUpperCase();
		
		// 初始化  
		this.init();
	};
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
			// 创建画布
			var pCanvas = document.createElement('canvas');
			pCanvas.id = "canvas" + _self.options.phaseIndex;
			pCanvas.width = 200;
			pCanvas.height = 200;
			pCanvas.style = "border: 3px solid #3f5c65;margin:1px;";
			// document.body.appendChild(pCanvas);
			$("#showContainer").append(pCanvas);

			var id = 'canvas' + _self.options.phaseIndex;
			_self.oCanvas = document.getElementById(id);
			if (_self.oCanvas == null) return;
			if (!_self.oCanvas.getContext) return;
			_self.canContext = _self.oCanvas.getContext("2d");

			_self.drawBg.onload = () => {
				_self.drawCrossShape(); // 绘制路口形状
				_self.drawPhaseId();
			};
			_self.drawImg.onload = () => {
				_self.drawSignalLight(); // 绘制信号组
			};
		},

		// 绘制相位ID
		drawPhaseId: function() {
			var _self = this;
			_self.canContext.beginPath();
			// 设置弧线的颜色为蓝色
			var circle = {
				x: 20, //圆心的x轴坐标值
				y: 20, //圆心的y轴坐标值
				r: 13 //圆的半径
			};
			// 以canvas中的坐标点(50,50)为圆心，绘制一个半径为50px的圆形
			_self.canContext.arc(circle.x, circle.y, circle.r, 0, Math.PI * 2, true);
			// 线宽
			_self.canContext.lineWidth = 2;
			// 绘制相位号		
			_self.canContext.strokeStyle = "#FF0000";
			_self.canContext.fillStyle = "#00FF00";
			_self.canContext.font = "16px Arial";
			_self.canContext.textAlign = 'center';
			_self.canContext.textBaseline = 'middle'
			_self.canContext.fillText(_self.options.phaseId, circle.x, circle.y + 1);
			_self.canContext.stroke();
		},

		// 绘制路口形状
		drawCrossShape: function() {
			var _self = this;
			switch (Number(_self.options.crossShape)) {
				case 0: // 东西一字			
					_self.canContext.drawImage(_self.drawBg, 0, 0, 200, 200, 0, 0, 200, 200);
					break;
				case 1: // 南北一字					
					_self.canContext.drawImage(_self.drawBg, 200, 0, 200, 200, 0, 0, 200, 200);
					break;
				case 2: // 十字
					_self.canContext.drawImage(_self.drawBg, 400, 0, 200, 200, 0, 0, 200, 200);
					break;
				case 3: // 东T
					_self.canContext.drawImage(_self.drawBg, 600, 0, 200, 200, 0, 0, 200, 200);
					break;
				case 4: // 西T
					_self.canContext.drawImage(_self.drawBg, 800, 0, 200, 200, 0, 0, 200, 200);
					break;
				case 5: // 南T
					_self.canContext.drawImage(_self.drawBg, 1000, 0, 200, 200, 0, 0, 200, 200);
					break;
				case 6: // 北T
					_self.canContext.drawImage(_self.drawBg, 1200, 0, 200, 200, 0, 0, 200, 200);
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

		// 绘制信号组
		drawSignalLight: function() {
			var _self = this;
			if (_self.options.usableSignal) { // 绘制可用信号组	
			var thisCrossShape=Number(_self.options.crossShape);			
				var signalGroup = _self.options.usableSignal.split(',');
				this.filterData(signalGroup);
				for (var key in signalGroup) {
					switch (signalGroup[key]) {
						case "1A":
							switch (thisCrossShape) {
								case 2: // 十字
									_self.canContext.drawImage(_self.drawImg, 180, 0, 18, 16, 150, 45, 18, 16);
									break;
							}
							break;
						case "1L":
							switch (thisCrossShape) {
								case 2: // 十字
								case 3: // 南T
								case 5: // 北T
									_self.canContext.drawImage(_self.drawImg, 0, 0, 18, 9, 150, 85, 18, 9);
									break;
							}
							break;
						case "1S":
							switch (thisCrossShape) {
								case 0: // 东西一字	
									_self.canContext.drawImage(_self.drawImg, 20, 0, 18, 9, 60, 65, 18, 9);
									break;
								case 1: // 南北一字
									break;
								case 2: // 十字
								case 5: // 南T
								case 6: // 北T
									_self.canContext.drawImage(_self.drawImg, 20, 0, 18, 9, 150, 75, 18, 9);
									break;
							}
							break;
						case "1R":
							switch (thisCrossShape) {
								case 2: // 十字
								case 3: // 南T
								case 6: // 北T
									_self.canContext.drawImage(_self.drawImg, 40, 0, 18, 9, 150, 65, 18, 9);
									break;
							}
							break;
						case "2A":
							switch (thisCrossShape) {
								case 2: // 十字
									_self.canContext.drawImage(_self.drawImg, 200, 0, 18, 16, 32, 139, 18, 16);
									break;
							}
							break;
						case "2L":
							switch (thisCrossShape) {
								case 2: // 十字
								case 4: // 南T
								case 6: // 北T
									_self.canContext.drawImage(_self.drawImg, 100, 0, 18, 9, 32, 106, 18, 9);
									break;
							}
							break;
						case "2S":
							switch (thisCrossShape) {
								case 0: // 东西一字	
									_self.canContext.drawImage(_self.drawImg, 80, 0, 18, 9, 122, 124, 18, 9);
									break;
								case 1: // 南北一字
									break;
								case 2: // 十字
								case 5: // 南T
								case 6: // 北T
									_self.canContext.drawImage(_self.drawImg, 80, 0, 18, 9, 32, 116, 18, 9);
									break;
							}
							break;
						case "2R":
							switch (thisCrossShape) {
								case 0: // 东西一字							
									break;
								case 1: // 南北一字
									break;
								case 2: // 十字
								case 4: // 南T
								case 5: // 北T
									_self.canContext.drawImage(_self.drawImg, 60, 0, 18, 9, 32, 126, 18, 9);
									break;
							}
							break;
						case "3A":
							switch (thisCrossShape) {
								case 2: // 十字
									_self.canContext.drawImage(_self.drawImg, 220, 0, 16, 18, 139, 150, 16, 18);
									break;
							}
							break;
						case "3L":
							switch (thisCrossShape) {
								case 2: // 十字
								case 4: // 南T
								case 5: // 北T
									_self.canContext.drawImage(_self.drawImg, 120, 0, 9, 18, 106, 150, 9, 18);
									break;
							}
							break;
						case "3S":
							switch (thisCrossShape) {
								case 1: // 南北一字
									_self.canContext.drawImage(_self.drawImg, 130, 0, 9, 18, 124, 60, 9, 18);
									break;
								case 2: // 十字
								case 3: // 东T
								case 4: // 西T
									_self.canContext.drawImage(_self.drawImg, 130, 0, 9, 18, 116, 150, 9, 18);
									break;
							}
							break;
						case "3R":
							switch (thisCrossShape) {
								case 2: // 十字
								case 3: // 南T
								case 5: // 北T
									_self.canContext.drawImage(_self.drawImg, 140, 0, 9, 18, 126, 150, 9, 18);
									break;
							}
							break;
						case "4A":
							switch (thisCrossShape) {
								case 2: // 十字
									_self.canContext.drawImage(_self.drawImg, 240, 0, 16, 18, 45, 32, 16, 18);
									break;
							}
							break;
						case "4L":
							switch (thisCrossShape) {
								case 2: // 十字
								case 3: // 南T
								case 6: // 北T
									_self.canContext.drawImage(_self.drawImg, 170, 0, 9, 18, 85, 32, 9, 18);
									break;
							}
							break;
						case "4S":
							switch (thisCrossShape) {
								case 1: // 南北一字
									_self.canContext.drawImage(_self.drawImg, 160, 0, 9, 18, 70, 122, 9, 18);
									break;
								case 2: // 十字
								case 3: // 东T
								case 4: // 西T
									_self.canContext.drawImage(_self.drawImg, 160, 0, 9, 18, 75, 32, 9, 18);
									break;
							}
							break;
						case "4R":
							switch (thisCrossShape) {
								case 2: // 十字
								case 4: // 南T
								case 6: // 北T
									_self.canContext.drawImage(_self.drawImg, 150, 0, 9, 18, 65, 32, 9, 18);
									break;
							}
							break;
						case "1P":
							switch (thisCrossShape) {
								case 0: // 东西一字
									_self.canContext.drawImage(_self.drawImg, 270, 0, 6, 112, 96, 44, 6, 112);
									break;
								case 2: // 十字
								case 3: // 东T
								case 5: // 南T
								case 6: // 北T
									_self.canContext.drawImage(_self.drawImg, 270, 0, 6, 112, 176, 44, 6, 112);
									break;
							}
							break;
						case "2P":
							switch (thisCrossShape) {								
								case 2: // 十字
								case 4: // 西T
								case 5: // 南T
								case 6: // 北T
									_self.canContext.drawImage(_self.drawImg, 270, 0, 6, 112, 18, 44, 6, 112);
									break;
							}
							break;
						case "3P":
							switch (thisCrossShape) {
								case 1: // 南北一字
									_self.canContext.drawImage(_self.drawImg, 0, 20, 112, 6, 44, 96, 112, 6);
									break;
								case 2: // 十字
								case 3: // 东T
								case 4: // 西T
								case 5: // 南T
									_self.canContext.drawImage(_self.drawImg, 0, 20, 112, 6, 44, 176, 112, 6);
									break;
							}
							break;
						case "4P":
							switch (thisCrossShape) {
								case 2: // 十字
								case 3: // 东T
								case 4: // 西T
								case 6: // 北T
									_self.canContext.drawImage(_self.drawImg, 0, 20, 112, 6, 44, 18, 112, 6);
									break;
							}
							break
						case "11P":
							switch (thisCrossShape) {
								case 0: // 东西一字	
									_self.canContext.drawImage(_self.drawImg, 260, 0, 6, 52, 96, 44, 6, 52);
									break;
								case 2: // 十字
								case 3: // 东T
								case 5: // 南T
								case 6: // 北T
									_self.canContext.drawImage(_self.drawImg, 260, 0, 6, 52, 176, 44, 6, 52);
									break;
							}
							break;
						case "12P":
							switch (thisCrossShape) {
								case 0: // 东西一字	
									_self.canContext.drawImage(_self.drawImg, 260, 0, 6, 52, 96, 104, 6, 52);
									break;
								case 2: // 十字
								case 3: // 东T
								case 5: // 南T
								case 6: // 北T								
									_self.canContext.drawImage(_self.drawImg, 260, 0, 6, 52, 176, 104, 6, 52);
									break;
							}
							break;
						case "21P":
							switch (thisCrossShape) {
								case 2: // 十字
								case 4: // 西T
								case 5: // 南T
								case 6: // 北T								
									_self.canContext.drawImage(_self.drawImg, 260, 0, 6, 52, 18, 104, 6, 52);
									break;
							}
							break;
						case "22P":
							switch (thisCrossShape) {
								case 2: // 十字
								case 4: // 西T
								case 5: // 南T
								case 6: // 北T								
									_self.canContext.drawImage(_self.drawImg, 260, 0, 6, 52, 18, 44, 6, 52);
									break;
							}
							break;
						case "31P":
							switch (thisCrossShape) {
								case 1: // 南北一字
									_self.canContext.drawImage(_self.drawImg, 0, 30, 52, 6, 104, 96, 52, 6);
									break;
								case 2: // 十字
								case 3: // 东T
								case 4: // 西T
								case 5: // 南T
									_self.canContext.drawImage(_self.drawImg, 0, 30, 52, 6, 104, 176, 52, 6);
									break;
							}
							break;
						case "32P":
							switch (thisCrossShape) {
								case 1: // 南北一字
									_self.canContext.drawImage(_self.drawImg, 0, 30, 52, 6, 44, 96, 52, 6);
									break;
								case 2: // 十字
								case 3: // 东T
								case 4: // 西T
								case 5: // 南T
									_self.canContext.drawImage(_self.drawImg, 0, 30, 52, 6, 44, 176, 52, 6);
									break;
							}
							break;
						case "41P":
							switch (thisCrossShape) {
								case 2: // 十字
								case 3: // 东T
								case 4: // 西T
								case 6: // 北T
									_self.canContext.drawImage(_self.drawImg, 0, 30, 52, 6, 44, 18, 52, 6);
									break;
							}
							break;
						case "42P":
							switch (thisCrossShape) {
								case 2: // 十字
								case 3: // 东T
								case 4: // 西T
								case 6: // 北T
									_self.canContext.drawImage(_self.drawImg, 0, 30, 52, 6, 104, 18, 52, 6);
									break;
							}
							break;
					}
				}
			}

			if (_self.options.greenSignal) { // 绘制绿灯信号组
				var greenGroup = _self.options.greenSignal.split(',');
				this.filterData(greenGroup);
				for (var key in greenGroup) {
					switch (greenGroup[key]) {
						case "1A":
							switch (thisCrossShape) {
								case 2: // 十字
									_self.canContext.drawImage(_self.drawImg, 180, 200, 18, 16, 150, 45, 18, 16);
									break;
							}
							break;
						case "1L":
							switch (thisCrossShape) {
								case 2: // 十字
								case 3: // 南T
								case 5: // 北T
									_self.canContext.drawImage(_self.drawImg, 0, 200, 18, 9, 150, 85, 18, 9);
									break;
							}
							break;
						case "1S":
							switch (thisCrossShape) {
								case 0: // 东西一字	
									_self.canContext.drawImage(_self.drawImg, 20, 200, 18, 9, 60, 65, 18, 9);
									break;
								case 1: // 南北一字
									break;
								case 2: // 十字
								case 5: // 南T
								case 6: // 北T
									_self.canContext.drawImage(_self.drawImg, 20, 200, 18, 9, 150, 75, 18, 9);
									break;
							}
							break;
						case "1R":
							switch (thisCrossShape) {
								case 2: // 十字
								case 3: // 南T
								case 6: // 北T
									_self.canContext.drawImage(_self.drawImg, 40, 200, 18, 9, 150, 65, 18, 9);
									break;
							}
							break;
						case "2A":
							switch (thisCrossShape) {
								case 2: // 十字
									_self.canContext.drawImage(_self.drawImg, 200, 200, 18, 16, 32, 139, 18, 16);
									break;
							}
							break;
						case "2L":
							switch (thisCrossShape) {
								case 2: // 十字
								case 4: // 南T
								case 6: // 北T
									_self.canContext.drawImage(_self.drawImg, 100, 200, 18, 9, 32, 106, 18, 9);
									break;
							}
							break;
						case "2S":
							switch (thisCrossShape) {
								case 0: // 东西一字	
									_self.canContext.drawImage(_self.drawImg, 80, 200, 18, 9, 122, 124, 18, 9);
									break;
								case 1: // 南北一字
									break;
								case 2: // 十字
								case 5: // 南T
								case 6: // 北T
									_self.canContext.drawImage(_self.drawImg, 80, 200, 18, 9, 32, 116, 18, 9);
									break;
							}
							break;
						case "2R":
							switch (thisCrossShape) {
								case 0: // 东西一字							
									break;
								case 1: // 南北一字
									break;
								case 2: // 十字
								case 4: // 南T
								case 5: // 北T
									_self.canContext.drawImage(_self.drawImg, 60, 200, 18, 9, 32, 126, 18, 9);
									break;
							}
							break;
						case "3A":
							switch (thisCrossShape) {
								case 2: // 十字
									_self.canContext.drawImage(_self.drawImg, 220, 200, 16, 18, 139, 150, 16, 18);
									break;
							}
							break;
						case "3L":
							switch (thisCrossShape) {
								case 2: // 十字
								case 4: // 南T
								case 5: // 北T
									_self.canContext.drawImage(_self.drawImg, 120, 200, 9, 18, 106, 150, 9, 18);
									break;
							}
							break;
						case "3S":
							switch (thisCrossShape) {
								case 1: // 南北一字
									_self.canContext.drawImage(_self.drawImg, 130, 200, 9, 18, 124, 60, 9, 18);
									break;
								case 2: // 十字
								case 3: // 东T
								case 4: // 西T
									_self.canContext.drawImage(_self.drawImg, 130, 200, 9, 18, 116, 150, 9, 18);
									break;
							}
							break;
						case "3R":
							switch (thisCrossShape) {
								case 2: // 十字
								case 3: // 南T
								case 5: // 北T
									_self.canContext.drawImage(_self.drawImg, 140, 200, 9, 18, 126, 150, 9, 18);
									break;
							}
							break;
						case "4A":
							switch (thisCrossShape) {
								case 2: // 十字
									_self.canContext.drawImage(_self.drawImg, 240, 200, 16, 18, 45, 32, 16, 18);
									break;
							}
							break;
						case "4L":
							switch (thisCrossShape) {
								case 2: // 十字
								case 3: // 南T
								case 6: // 北T
									_self.canContext.drawImage(_self.drawImg, 170, 200, 9, 18, 85, 32, 9, 18);
									break;
							}
							break;
						case "4S":
							switch (thisCrossShape) {
								case 1: // 南北一字
									_self.canContext.drawImage(_self.drawImg, 160, 200, 9, 18, 70, 122, 9, 18);
									break;
								case 2: // 十字
								case 3: // 东T
								case 4: // 西T
									_self.canContext.drawImage(_self.drawImg, 160, 200, 9, 18, 75, 32, 9, 18);
									break;
							}
							break;
						case "4R":
							switch (thisCrossShape) {
								case 2: // 十字
								case 4: // 南T
								case 6: // 北T
									_self.canContext.drawImage(_self.drawImg, 150, 200, 9, 18, 65, 32, 9, 18);
									break;
							}
							break;
						case "1P":
							switch (thisCrossShape) {
								case 0: // 东西一字
									_self.canContext.drawImage(_self.drawImg, 270, 200, 6, 112, 96, 44, 6, 112);
									break;
								case 2: // 十字
								case 3: // 东T
								case 5: // 南T
								case 6: // 北T
									_self.canContext.drawImage(_self.drawImg, 270, 200, 6, 112, 176, 44, 6, 112);
									break;
							}
							break;
						case "2P":
							switch (thisCrossShape) {
								case 2: // 十字
								case 4: // 西T
								case 5: // 南T
								case 6: // 北T
									_self.canContext.drawImage(_self.drawImg, 270, 200, 6, 112, 18, 44, 6, 112);
									break;
							}
							break;
						case "3P":
							switch (thisCrossShape) {
								case 1: // 南北一字
									_self.canContext.drawImage(_self.drawImg, 0, 220, 112, 6, 44, 96, 112, 6);
									break;
								case 2: // 十字
								case 3: // 东T
								case 4: // 西T
								case 5: // 南T
									_self.canContext.drawImage(_self.drawImg, 0, 220, 112, 6, 44, 176, 112, 6);
									break;
							}
							break;
						case "4P":
							switch (thisCrossShape) {
								case 2: // 十字
								case 3: // 东T
								case 4: // 西T
								case 6: // 北T
									_self.canContext.drawImage(_self.drawImg, 0, 220, 112, 6, 44, 18, 112, 6);
									break;
							}
							break
						case "11P":
							switch (thisCrossShape) {
								case 0: // 东西一字	
									_self.canContext.drawImage(_self.drawImg, 260, 200, 6, 52, 96, 44, 6, 52);
									break;
								case 2: // 十字
								case 3: // 东T
								case 5: // 南T
								case 6: // 北T
									_self.canContext.drawImage(_self.drawImg, 260, 200, 6, 52, 176, 44, 6, 52);
									break;
							}
							break;
						case "12P":
							switch (thisCrossShape) {
								case 0: // 东西一字	
									_self.canContext.drawImage(_self.drawImg, 260, 200, 6, 52, 96, 104, 6, 52);
									break;
								case 2: // 十字
								case 3: // 东T
								case 5: // 南T
								case 6: // 北T								
									_self.canContext.drawImage(_self.drawImg, 260, 200, 6, 52, 176, 104, 6, 52);
									break;
							}
							break;
						case "21P":
							switch (thisCrossShape) {
								case 2: // 十字
								case 4: // 西T
								case 5: // 南T
								case 6: // 北T								
									_self.canContext.drawImage(_self.drawImg, 260, 200, 6, 52, 18, 104, 6, 52);
									break;
							}
							break;
						case "22P":
							switch (thisCrossShape) {
								case 2: // 十字
								case 4: // 西T
								case 5: // 南T
								case 6: // 北T								
									_self.canContext.drawImage(_self.drawImg, 260, 200, 6, 52, 18, 44, 6, 52);
									break;
							}
							break;
						case "31P":
							switch (thisCrossShape) {
								case 1: // 南北一字
									_self.canContext.drawImage(_self.drawImg, 0, 230, 52, 6, 104, 96, 52, 6);
									break;
								case 2: // 十字
								case 3: // 东T
								case 4: // 西T
								case 5: // 南T
									_self.canContext.drawImage(_self.drawImg, 0, 230, 52, 6, 104, 176, 52, 6);
									break;
							}
							break;
						case "32P":
							switch (thisCrossShape) {
								case 1: // 南北一字
									_self.canContext.drawImage(_self.drawImg, 0, 230, 52, 6, 44, 96, 52, 6);
									break;
								case 2: // 十字
								case 3: // 东T
								case 4: // 西T
								case 5: // 南T
									_self.canContext.drawImage(_self.drawImg, 0, 230, 52, 6, 44, 176, 52, 6);
									break;
							}
							break;
						case "41P":
							switch (thisCrossShape) {
								case 2: // 十字
								case 3: // 东T
								case 4: // 西T
								case 6: // 北T
									_self.canContext.drawImage(_self.drawImg, 0, 230, 52, 6, 44, 18, 52, 6);
									break;
							}
							break;
						case "42P":
							switch (thisCrossShape) {
								case 2: // 十字
								case 3: // 东T
								case 4: // 西T
								case 6: // 北T
									_self.canContext.drawImage(_self.drawImg, 0, 230, 52, 6, 104, 18, 52, 6);
									break;
							}
							break;
					}
				}
			}

		},
	};
	window.PhaseCtr = Phase;
}(jQuery,window, document));
