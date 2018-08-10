import * as React from 'react';
import html2canvas from 'html2canvas';
import css from './index.less';
import source from './assets/demo.jpg';

const ua = window.navigator.userAgent;
const isMobile = /(iphone|ipad|ipod|android)/ig.test(ua);

const currentState = {
  imgWidth: 'auto',
  imgHeight: 'auto',
  imgOldWidth: 0,
  imgOldHeight: 0,
  boxLeft: 5,
  boxTop: 5,
  imgScale: 1,
  boxScale: 1,
  boxScaleX: 0,
  boxScaleY: 0,
  imgLeft: 0,
  imgTop: 0,
  cutUrl: '',
};

export default class Cropper extends React.PureComponent {
  static defaultProps = {
    boxWidth: 200,
    boxHeight: 200,
    showGrid: true,
    file: {},
    getCutFile: () => null,
  }
  constructor(props) {
    super(props);
    const { boxWidth, boxHeight } = props;
    this.state = {
      boxWidth,
      boxHeight,
      ...currentState
    };
  }

  componentDidMount() {
    const cropper = document.getElementById('cropper');
    if (cropper) {
      cropper.addEventListener('mousewheel', this._onMouseWheel, true);
      this.cropper = cropper;
    }

    this._updateImageSize();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.file !== this.props.file) {
      this._updateImageSize();
    }
  }

  componentWillUnmount() {
    if (this.cropper) {
      this.cropper.removeEventListener('mousewheel', this._onMouseWheel, true);
    }
  }

  _onMouseWheel = (e) => {
    e.preventDefault();
    e.stopPropagation();
    let { imgScale } = this.state;
    if (e.deltaY > 0) {
      imgScale = (imgScale * 100 + 1) / 100;
    } else {
      imgScale = (imgScale * 100 - 1) / 100;
    }
    this.setState({ imgScale });
  }

  _updateImageSize = () => {
    const cropperPixel = document.querySelector(`.${css.cropper_pixel}`);
    const image = document.querySelector('#cropper_cut_img');
    image.style.width = 'auto';
    image.style.height = 'auto';
    if (image) {
      const pixRect = cropperPixel.getBoundingClientRect();
      image.onload = () => {
        const rect = image.getBoundingClientRect();
        const { width, height } = rect;
        const imgLeft = (pixRect.width - width) / 2;
        const imgTop = (pixRect.height - height) / 2;
        this.setState({
          imgWidth: width,
          imgHeight: height,
          imgLeft, imgTop,
          imgOldWidth: width,
          imgOldHeight: height,
        });
      }
    }
  }

  _onResetState = () => {
    const { imgWidth, imgHeight, ...rest } = currentState;
    const { imgOldWidth, imgOldHeight } = this.state;
    console.log(imgOldWidth);
    this.setState({
      boxWidth: 200,
      boxHeight: 200,
      imgWidth: imgOldWidth,
      imgHeight: imgOldHeight,
      ...rest,
    });
  }

  _onCropper = () => {
    const { file, getCutFile } = this.props;
    html2canvas(this.box, {
      allowTaint: true,
    }).then(entity => {
      const image = entity.toDataURL();
      const name = file && file.content.name || 'cropper example';
      const newFile = new File([image], name);

      this.setState({
        cutUrl: image,
      }, () => {
        getCutFile(newFile);
      });
    });
  }

  _onMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const target = e.target;
    const { pageX, pageY } = e;

    let { boxLeft, boxTop } = this.state;

    const disx = pageX - boxLeft;
    const disy = pageY - boxTop;

    const onMouseMove = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const left = e.pageX - disx;
      const top = e.pageY - disy;

      this.setState({ boxLeft: left, boxTop: top });

      const onMouseUp = (e) => {
        e.preventDefault();
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        target.removeEventListener('mouseup', onMouseUp);
      }

      document.addEventListener('mouseup', onMouseUp, false);
    }
    document.addEventListener('mousemove', onMouseMove, false);
  }

  _onPointMouseDown = (e) => {
    const dataKey = e.target.getAttribute('data-key');
    console.log(dataKey);

    const { pageX, pageY } = e;
    let { boxScale, boxScaleX, boxScaleY } = this.state;
    let disx = 0;
    let disy = 0;

    if (dataKey === 'rb' || dataKey === 'tr') {
      disx = pageX - boxScaleX;
      disy = pageY - boxScaleY;
    } else if (dataKey === 'rm') {
      disx = pageX - boxScaleX;
    }
    const onMouseMove = (e) => {
      let x = 0, y = 0;

      if (dataKey === 'rb' || dataKey === 'tr') {
        x = e.pageX - disx;
        y = e.pageY - disy;
        boxScale = (x + y) >> 1;
      } else if (dataKey === 'rm') {
        x = e.pageX - disx;
      }
      this.setState({
        boxScale,
        boxScaleX: x,
        boxScaleY: y,
      });

      const onMouseUp = (e) => {
        document.removeEventListener('mousemove', onMouseMove, false);
        document.removeEventListener('mouseup', onMouseUp, false);
      }

      document.addEventListener('mouseup', onMouseUp, false);
    }

    document.addEventListener('mousemove', onMouseMove, false);

    this.setState({ dataKey });
  }

  _renderCutBox = (width, height) => {
    const {
      cutUrl,
      boxWidth,
      boxHeight,
      boxLeft,
      boxTop,
      imgScale,
      imgWidth,
      imgHeight,
      imgLeft,
      imgTop,
      boxScale,
      boxScaleX,
      boxScaleY,
      dataKey,
    } = this.state;

    const { file, showGrid } = this.props;
    const _src = file.url || source;


    let bleft = boxLeft;
    let btop = boxTop;
    if (dataKey === 'rb') {
      bleft = boxLeft;
    } else if (dataKey === 'tr') {
      console.log('here');
      // bleft = boxLeft - boxScaleX;
      btop = boxTop + boxScaleY;
    }
    // const bleft = dataKey === 'rt' ? boxLeft - boxScaleX : boxLeft;

    return <div className={css.cropper_cut_box}
      style={{
        width: boxWidth + boxScaleX,
        height: boxHeight + boxScaleY,
        left: bleft,
        top: btop,
      }}
      >
      <span className={css.cropper_cut_point} onMouseDown={this._onPointMouseDown} data-key="lt"></span>
      <span className={css.cropper_cut_point} onMouseDown={this._onPointMouseDown} data-key="tm"></span>
      <span className={css.cropper_cut_point} onMouseDown={this._onPointMouseDown} data-key="tr"></span>
      <span className={css.cropper_cut_point} onMouseDown={this._onPointMouseDown} data-key="rm"></span>
      <span className={css.cropper_cut_point} onMouseDown={this._onPointMouseDown} data-key="rb"></span>
      <span className={css.cropper_cut_point} onMouseDown={this._onPointMouseDown} data-key="bm"></span>
      <span className={css.cropper_cut_point} onMouseDown={this._onPointMouseDown} data-key="bl"></span>
      <span className={css.cropper_cut_point} onMouseDown={this._onPointMouseDown} data-key="lm"></span>

      <div className={css.cropper_move}
        ref={move => this.move = move}
        onMouseDown={this._onMouseDown}
        >
        {showGrid && <div className={css.col}></div>}
        {showGrid && <div className={css.row}></div>}
      </div>

      <div className={css.cut_image}
        ref={box => this.box = box}
        >
        <img
          id="cropper_cut_img"
          style={{
            marginLeft: -boxLeft - 1,
            marginTop: -boxTop - 1,
            width,
            height
          }}
          src={_src} alt="" />
      </div>

    </div>
  }

  render() {
    const {
      cutUrl,
      imgScale,
      imgWidth,
      imgHeight,
      imgLeft,
      imgTop,
    } = this.state;

    const { file, showGrid } = this.props;

    const cropperClass = isMobile ? `${css.cropper} ${css.is_mobile}` : css.cropper;

    /**操作按钮*/
    const operations = <div className={css.cropper_btns}>
      <button onClick={this._onResetState}>重置</button>
      <button onClick={this._onCropper}>裁剪</button>
    </div>;


    /**计算图片的大小*/
    const width = typeof imgWidth === 'number' ? imgWidth * imgScale : imgWidth;
    const height = typeof imgHeight === 'number' ? imgHeight * imgScale : imgHeight;
    const _src = file.url || source;

    if (cutUrl) {
      return <div className={cropperClass}>
        <div className={css.cut_result}>
          <img src={cutUrl} alt="" />
        </div>
        {operations}
      </div>;
    }

    const cutBox = this._renderCutBox(width, height);

    return <div className={cropperClass} id="cropper">
      <div className={css.cropper_pixel}>
        <div className={css.cropper_source_image}>
          <img
            style={{ width, height }}
            src={_src} alt="" />
        </div>

        <div className={css.cropper_filter}>
        </div>

        {cutBox}
      </div>

      {operations}
    </div>
  }
}