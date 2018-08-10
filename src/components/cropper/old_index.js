import * as React from 'react';
import html2canvas from 'html2canvas';
import css from './index.less';
import source from '@assets/demo1.jpg';

const isMobile = false;

const currentState = {
  img_width: 'auto',
  img_height: 'auto',
  box_left: 5,
  box_top: 5,
  scale: 1,
  box_scale: 1,
  box_scale_x: 0,
  box_scale_y: 0,
  cutUrl: '',
};
export default class Screenshot extends React.PureComponent {
  static defaultProps = {
    getCutfile: () => null,
  };
  constructor(props) {
    super(props);
    this.state = {
      box_width: props.boxWidth || 200,
      box_height: props.boxHeight || 200,
      ...currentState,
    };
  }

  componentDidMount() {
    window.addEventListener('mousewheel', this._onMouseWheel, true);

    this.sourceImageUpdate();
  }

  sourceImageUpdate = () => {
    const sourceImage = document.querySelector('#cropper_cut_img');

    sourceImage.onload = () => {
      const rect = sourceImage.getBoundingClientRect();
      const { width, height } = rect;
      this.setState({ img_width: width, img_height: height });
    }
  }

  componentWillMount() {
    window.removeEventListener('mousewheel', this._onMouseWheel, true);
  }

  _resetState = () => {
    const { boxWidth, boxHeight } = this.props;
    this.setState({
      box_width: boxWidth || 200,
      box_height: boxHeight || 200,
      ...currentState,
    }, () => {
      this.sourceImageUpdate();
    });
  }

  _onMouseWheel = (e) => {
    // 放大
    let { scale } = this.state;
    if (e.deltaY > 0) {
      scale = (scale * 100 + 1) / 100;
    } else {
      scale = (scale * 100 - 1) / 100;
    }
    this.setState({ scale });
  }

  _onMouseDown = (e) => {
    const { box_left, box_top } = this.state;
    const { pageX, pageY } = e;
    const container = document.querySelector(`.${css.cropper_pixel}`);
    const self = this;
    const disX = pageX - box_left;
    const disY = pageY - box_top;
    document.addEventListener('mousemove', onMouseMove, false);
    function onMouseMove(e) {
      const left = e.pageX - disX;
      const top = e.pageY - disY;

      self.setState({ box_left: left, box_top: top });

      document.addEventListener('mouseup', onMouseUp, true);

      function onMouseUp() {
        document.removeEventListener('mousemove', onMouseMove, false);
        // document.removeEventListener('mouseup', onMouseUp);
        // container.removeEventListener('mouseup', onMouseUp);
      }

      return false;
    }
  }

  _cutBoxMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const { pageX, pageY } = e;
    let { box_scale, box_scale_x, box_scale_y } = this.state;
    if (e.currentTarget.className === css.cropper_cut_point) {

      document.addEventListener('mousemove', onMouseMove, false);
      const self = this;
      function onMouseMove(e) {
        const x = e.pageX - pageX;
        const y = e.pageY - pageY;
        // 缩小
        // if (x < 0 && y < 0) {
        //     box_scale = (box_scale * 100 - 1) / 100;
        // } else {
        //     box_scale = (box_scale * 100 + 1) / 100;          
        // }

        box_scale = (x + y) >> 1;

        self.setState({ box_scale, box_scale_x: x, box_scale_y: y });

        document.addEventListener('mouseup', onMouseUp, false);

        function onMouseUp() {
          document.removeEventListener('mousemove', onMouseMove, false);
          // document.removeEventListener('mouseup', onMouseUp, false);
          // self.setState({
          //   box_scale_x: 0,
          //   box_scale_y: 0,
          // });
        }
      }
    }
  }

  _onCropper = () => {
    const { file, getCutfile } = this.props;
    html2canvas(this.box, {
      allowTaint: true,
    }).then((entity) => {
      const image = entity.toDataURL();
      const name = file && file.content.name || 'Cropper Example';
      const file = new File([image], name);
      this.setState({
        cutUrl: image,
      }, () => {
        console.log(file);
        getCutfile(file);
      })
    });
  }

  render() {

    const {
      box_width,
      box_height,
      box_left,
      box_top,
      img_width,
      img_height,
      scale,
      box_scale,
      cutUrl,
      box_scale_x,
      box_scale_y
    } = this.state;
    const { file } = this.props;
    const _src = file.url || source;
    const width = typeof img_width === 'number' ? img_width * scale : img_width;
    const height = typeof img_height === 'number' ? img_height * scale : img_height;
    const wrapperClass = isMobile ? `${css.cropper} ${css.isMobile}` : css.cropper;

    const operation = <div className={css.cropper_btns}>
      <button onClick={this._resetState}>重置</button>
      <button onClick={this._onCropper}>裁剪</button>
    </div>;

    if (cutUrl) {
      return <div className={wrapperClass}>
        <div className={css.cut_result}>
          <img src={cutUrl} alt="" />
        </div>
        {operation}
      </div>
    }

    return <div className={wrapperClass}>
      <div className={css.cropper_pixel}>

        <div className={css.cropper_source_image}>
          <img
            style={{ width, height }}
            src={_src} alt="" />
        </div>

        <div className={css.cropper_filter}></div>

        <div className={css.cropper_cut_box}
          style={{
            width: box_width + box_scale,
            height: box_height + box_scale,
            left: box_left,
            top: box_top,
          }}
          >
          <div className={css.cropper_move}
            ref={move => this.move = move}
            onMouseDown={this._onMouseDown}
            ></div>
          <span className={css.cropper_cut_point}></span>
          <span className={css.cropper_cut_point}></span>
          <span className={css.cropper_cut_point}
            onMouseDown={this._cutBoxMouseDown}
            ></span>
          <span className={css.cropper_cut_point}></span>

          <div className={css.cut_image}
            ref={box => this.box = box}
            >
            <img
              id="cropper_cut_img"
              style={{
                marginLeft: -box_left - 1,
                marginTop: -box_top - 1,
                width,
                height
              }}
              src={_src} alt="" />
          </div>
        </div>
      </div>
      {operation}
    </div>
  }
}