import * as React from 'react';
import Upload from '@components/upload';
import Screenshot from '@components/cropper';
import css from './index.less';

export default class Wrapper extends React.PureComponent {
  state = {
    screenshot: false,
    file: '',
    url: ''
  };

  _onChange = ({ file }) => {
    console.log(file);

    this.setState({ file, screenshot: true });
  }

  render() {
    const { screenshot, file } = this.state;

    return <div className={css.wrapper}>
      <Screenshot file={file} /*boxWidth={300} boxHeight={200} *//>
      <Upload
        hasUrl
        radius
        onChange={this._onChange}
        cls={css.upload_img}>
        <span>上传</span>
      </Upload>
    </div>
  }
}