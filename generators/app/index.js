var Generator = require('yeoman-generator');
var path = require('path');
var yosay = require('yosay');
var chalk = require('chalk');
var mkdirp = require('mkdirp');

module.exports = class extends Generator {
    constructor(args, opts) {
        super(args, opts);

        this.option('babel'); // This method adds support for a `--babel` flag
    }

    //初始化阶段
    initializing() {
        console.log('>>>initializing...');
        if (!this.options['skip-welcome-message']) {
            this.log(require('yeoman-welcome'));
            this.log(
                'This generator will generator a Vue.js project for you, including webpack work flow and some default Vue components and tools.\n'
            );
        }
        this.props = {};
    }

    //接受用户输入的阶段
    prompting() {
        console.log('>>>prompting...');
        var done = this.async();

        this.log(
            yosay(
                'Welcome to the ' +
                    chalk.red('generator-enjoy-rollup') +
                    ' generator!'
            )
        );

        var execSync = require('child_process').execSync;
        var execSyncGitCommand = function(gitCommand) {
            var result = execSync(gitCommand, { encoding: 'utf-8' }).trim();
            return result;
        };
        var author = this.user.git.name();
        var email = this.user.git.email();

        var prompts = [
            {
                type: 'input',
                name: 'projectName',
                message: 'Project name (' + this.appname + '):',
                default: this.appname
            },
            {
                type: 'input',
                name: 'projectVersion',
                message: 'Project version (1.0.0):',
                default: '1.0.0'
            },
            {
                type: 'input',
                name: 'projectDesc',
                message: 'Project description:',
                default: ''
            },
            {
                type: 'input',
                name: 'projectAuthor',
                message: 'Author Name(' + author + '):',
                default: author
            },
            {
                type: 'input',
                name: 'projectEmail',
                message: 'Author Email(' + email + '):',
                default: email
            }
        ];

        return this.prompt(prompts).then(props => {
            // To access props later use this.props.someAnswer;
            props.projectCwd = process.cwd();
            props.projectNameCamelCase = this._toCamelCase(props.projectName);
            props.projectCreatedAt = this._formatDate(new Date().getTime(), 'YYYY-MM-DD');
            this.props = props;
            // To access props later use this.props.someOption;
            done();
        });
    }

    //保存配置信息和文件，如.editorconfig
    configuring() {
        console.log('>>>configuring...');
    }

    //非特定的功能函数名称
    defaults() {
        console.log('>>>defaults...');
        if (path.basename(this.destinationPath()) !== this.props.projectName) {
            this.log(
                'Your generator must be inside a folder named ' +
                    this.props.projectName +
                    '\n' +
                    'We\'ll automatically create this folder for you.'
            );
            mkdirp(this.props.projectName);

            this.destinationPath(this.props.projectName)
            this.destinationRoot(this.destinationPath(this.props.projectName));
        }
    }

    //声称项目目录结构阶段
    writing() {
        console.log('>>>writing...');
        this._copyTpl('_babelrc', '.babelrc');
        this._copyTpl('_DEV-README.md', 'DEV-README.md');
        this._copyTpl('_CHANGELOG.md', 'CHANGELOG.md');
        this._copyTpl('_editorconfig', '.editorconfig');
        this._copyTpl('_eslintignore', '.eslintignore');
        this._copyTpl('_eslintrc', '.eslintrc');
        this._copyTpl('_gitignore', '.gitignore');
        this._copyTpl('_LICENSE.md', 'LICENSE.md');
        this._copyTpl('_package.json', 'package.json');
        this._copyTpl('_postcssrc.js', '.postcssrc.js');
        this._copyTpl('_README.md', 'README.md');
        this._copyTpl('_rollup.config.js', 'rollup.config.js');

        this._copyTpl('./src', './src');
        this._copyTpl('./test', './test');
    }

    //统一处理冲突，如要生成的文件已经存在是否覆盖等处理
    conflicts() {
        console.log('>>>conflicts...');
    }

    //安装依赖阶段，如通过npm、bower
    install() {
        console.log('>>>install...');
        this.installDependencies({
            npm: true,
            bower: false,
            yarn: false
        });
    }

    //生成器即将结束
    end() {
        console.log('>>>end...');
    }

    _copy(from, to) {
        this.fs.copy(this.templatePath(from), this.destinationPath(to));
    }

    _copyTpl(from, to) {
        //注意这里的第三个参数是要传入的那些变量，而不是传this
        this.fs.copyTpl(
            this.templatePath(from),
            this.destinationPath(to),
            this.props
        );
    }

    _toCamelCase(str) {
        let arr = str.split('-');
        let ret = '';

        for (let i = 0; i < arr.length; i++) {
            if (i === 0) {
                ret += arr[i];
            } else {
                ret += arr[i].charAt(0).toUpperCase() + arr[i].substr(1);
            }
        }

        return ret;
    }

    _addZero(str) {
        let newStr = str + '';

        if (newStr.length === 1) {
            newStr = '0' + newStr;
        }

        return newStr;
    }

    _formatDate(timestamp, formatStr) {
        const defaultFormatStr = 'YYYY-MM-DD hh:mm:ss';

        let year;
        let month;
        let date;
        let hour;
        let minute;
        let second;

        if (timestamp === undefined) {
            throw 'formatDate: parameter timestamp error';
        } else if (typeof timestamp === 'string') {
            timestamp = parseInt(timestamp, 10);
            if (isNaN(timestamp)) {
                throw 'formatDate: parameter timestamp error';
            } else {
                timestamp = new Date(timestamp);
            }
        } else if (typeof timestamp === 'number' && !isNaN(timestamp)) {
            timestamp = new Date(timestamp);
        } else {
            throw 'formatDate: timestamp type error';
        }

        year = timestamp.getFullYear();
        month = this._addZero(timestamp.getMonth() + 1);
        date = this._addZero(timestamp.getDate());
        hour = this._addZero(timestamp.getHours());
        minute = this._addZero(timestamp.getMinutes());
        second = this._addZero(timestamp.getSeconds());

        if (!formatStr) {
            formatStr = defaultFormatStr;
        }
        formatStr = formatStr.replace(/YYYY/, year);
        formatStr = formatStr.replace(/MM/, month);
        formatStr = formatStr.replace(/DD/, date);
        formatStr = formatStr.replace(/hh/, hour);
        formatStr = formatStr.replace(/mm/, minute);
        formatStr = formatStr.replace(/ss/, second);

        return formatStr;
    }
};
