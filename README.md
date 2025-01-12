# 人生重开模拟器_AI

简体中文 | [English](./README-EN.md)

## 简介

基于神戸小鳥（VickScarlet）的[Life Restart v1.1.0-beta改编](https://github.com/VickScarlet/lifeRestart/tree/v1.1.0-beta?tab=readme-ov-file)。
### 关于为什么要引入AI？
原版的游戏中的点数（颜值、智力、体质、家境、快乐）对于玩家的注意力吸引不大，玩家只能点击点击然后看到新的事件，除了最开始的分配点数，后面都无法对点数进行改变。后来我发现事件的出现并不是完全随机的，是与点数有一定关联的。为了不浪费这一套数据，我引入了22年出现的大模型AI（游戏是21年的），通过向AI发送事件描述，获取到AI给予的点数变化，同时为了让玩家有所体验，也让AI给出了选项并且也给了玩家自定义事件的权力（甚至可以一直刷点数）。
### 疑问
1.由于使用的是1.1.0版本，后续最新的2.0版本更新了新的事件与天赋，由于2.0版本使用了laya引擎，所以我并不能确定能否都直接替换使用，欢迎有兴趣的伙伴帮助。

2.热模块毫无作用啊QAQ，全程都是重建再打开，不知道这重建了几百次了。

## 变化
![人生重开模拟器](./人生重开模拟器_AI海报.png)

1.修改内容包含src部分，css部分。主要增加API的调用，与更新到本地数据，为提升体验，采用流式文字显示。

2.界面主要修改的区域是lifeTrajectory。新增添了一个有关AI返回的选项框与向AI发送的文本框。

3.人生总结部分增加了一个下载按钮（毫无美化）。由于前端无法直接修改data中的内容，所以将此次ai返回的所有选项与数据进行保存，在这里的下载可以下载到所有的事件数据并进行手动替换，可以方便下一次无需再调用api，直接使用本地数据。

4.文心一言API每日限量1000次数（500*2）。调用部分目前还是摆设。第一个500次使用完会自动调用第二个，不过会导致后续的下载功能失效一部分。

5.增加小ai模式，第一次通关便自动开启，全程ai，不再调用本地。

6.后续可能添加一个全AI模式，每次调用会把此次事件前的每一年的经历都会作为参数输入，这样就避免出现前后不连贯的效果。蒙住选项，只显示几个字，让玩家进行猜选。随着年龄变化，代表着随着年龄改变，对于自己的掌控更大。


## 使用

<details>
<summary><strong>网页版</strong></summary>
<br />

1. 下载项目代码。

```bash
git clone https://github.com/X-2w/lifeRestart_AI.git my-project
cd my-project
```

2. 进入目录安装依赖。

```bash
yarn install
```

或者

```bash
npm install
```

3. 启动本地服务器。

```bash
yarn dev
```

或者

```bash
npm run dev
```

4. 启动完成后会自动打开浏览器访问 [http://localhost:8081/view/index.html](http://localhost:8081/view/index.html)。

</details>

<details>
<summary><strong>控制台版本</strong></summary>
<br />

```bash
node repl
```

</details>
