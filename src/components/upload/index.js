import css from './index.less';
export default (props) => {
  const {
    txt,
    accept,
    cls,
    radius,
    children,
    beforeUpload,
    disabled = false,
    hasUrl = false,
    onChange,
    ...rest
  } = props;
  const className = `${css.ts_upload} ${cls}`;

  // 兼容base64
  const uploadEvent = (target, file) => {
    if (beforeUpload) {
      /**
       * 如果上传之前限制了，直接不做操作.
       * @param: bool
      */
      const beforeFile = file.content || file;
      if (beforeUpload(beforeFile)) {
        onChange({ file, index: 1 });
      } else {
        target.value = '';
      }
    } else {
      onChange({ file, index: 1 });
    }
  }

  const curryOnChange = (e) => {
    e.preventDefault();
    const files = e.target.files;
    const _target = e.target;
    if (hasUrl) {
      if (typeof FileReader === 'undefined') {
        // Toast.fail('抱歉，您的浏览器不支持FileReader');
        alert('抱歉，您的浏览器不支持FileReader');
        return;
      }
      let url = '';
      const reader = new FileReader();
      console.log(reader);
      reader.readAsDataURL(files[0]);
      reader.onload = () => {
        url = reader.result;
        const file = {
          content: files[0],
          url
        };
        uploadEvent(_target, file);
      };
    } else {
      uploadEvent(_target, files[0]);
    }
  };

  const currentAccept = accept || 'image/gif, image/jpeg, image/png, image/jpg';
  const radiuStyle = {
    borderRadius: radius ? '0' : '50%'
  };
  return <div
    className={className}
    {...rest}>
    {children ? <div className={css.child} style={radiuStyle}>{children}</div> : <span>{txt}</span>}
    <input
      accept={currentAccept}
      type="file"
      disabled={disabled}
      onChange={curryOnChange} />
  </div>
}