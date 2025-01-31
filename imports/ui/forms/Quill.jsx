import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import '../utils/styles/quilleditor-custom.css';
import { editorFormats, editorModules } from '../utils/constants/quillConfig';

export default function (props) {
  const [isFocused, setIsFocused] = useState(false);
  let megaContainer = 'quill-megacontainer';
  if (isFocused) {
    megaContainer += ' is-focused';
  }

  return (
    <div
      className={megaContainer}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
    >
      <ReactQuill
        formats={editorFormats}
        modules={editorModules}
        style={{ borderColor: 'magenta' }}
        {...props}
      />
    </div>
  );
}
