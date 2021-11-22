// import moment from 'moment'
import React, { PureComponent, useState } from 'react'
import {
  Input,
  Upload,
  Form,
  Button,
  InputNumber,
  Select,
  DatePicker,
  Spin,
  Image,
  Switch,
  Radio,
  Modal,
} from 'antd'

import { UploadOutlined, PlusCircleOutlined } from '@ant-design/icons'
import S from 'string'

const RadioGroup = Radio.Group

const Option = Select.Option
const {TextArea} = Input

const styles = {
  mainDiv: {
    position: 'relative',
  },
  loadingBox: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    width: '100%',
    backgroundColor: 'rgba(255, 255,255, 0.5)',
    textAlign: 'center',
    paddingTop: '10%',

  },
}

function getBase64 (file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = error => reject(error)
  })
}

const SimpleFormElement = (props) => {

  const [previewVisible, setPreviewVisible] = useState(false)
  const [previewImage, setPreviewImage] = useState()
  const [previewTitle, setPreviewTitle] = useState('Image')

  const handleCancel = () => setPreviewVisible(false)

  const handlePreview = async file => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj)
    }

    setPreviewVisible(true)
    setPreviewImage(file.url || file.preview)
    setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf('/') + 1))
  }

  const section = (type) => {

    let x = props
    let {item, apiurl} = props

    switch (type) {
      case 'number':
        return <InputNumber {...x} {...item} />

      case 'customNumber':
        delete item.type
        return <InputNumber {...item}/>

      case 'date':
        return <DatePicker {...x} format={item.format}/>

      /*  case 'fileback':

          let limit = 1
          if (!!item.limit) limit = item.limit

          let {fileList, item: {key, photos, updateDisable}} = x

          let uploadEnable = true
          if (fileList !== undefined) {
            if (fileList.length >= limit) {
              uploadEnable = false
            }
          }

          let uploadButton = <Button><UploadOutlined/></Button>

          let listTypeProps = {}
          if (photos) {
            listTypeProps = {
              listType: 'picture-card',
              onPreview: this.handlePreview,
              onChange: this.handleChange,
            }
            uploadButton = (<div>
              <Icon type="plus"/>
              <div className="ant-upload-text">Upload</div>
            </div>)
          }

          return (
            <React.Fragment>
              <Upload
                name={'file'}
                {...listTypeProps}
                action={`${apiurl}/filesUploader`}
                defaultFileList={item.defaultFileList}
                showUploadList={{
                  showPreviewIcon: true,
                  showRemoveIcon: !updateDisable,
                }}
                {...x}
              >
                {uploadEnable && !updateDisable && (uploadButton)}
                Upload File
              </Upload>
              {/!*
              <Modal visible={this.state.previewVisible} footer={null}
                     onCancel={this.handleCancel}>
                <img alt="example" style={{width: '100%'}}
                     src={this.state.previewImage}/>
              </Modal>
            *!/}

            </React.Fragment>
          )
  */
      case 'file':

        let limit = 1
        if (!!item.limit) limit = item.limit

        let {fileList, item: {key, photos, updateDisable}} = x

        let uploadEnable = true
        if (fileList !== undefined) {
          if (fileList.length >= limit) {
            uploadEnable = false
          }
        }

        let uploadButton = <Button><UploadOutlined/></Button>

        let listTypeProps = {}
        if (photos) {
          listTypeProps = {
            listType: 'picture-card',
            onPreview: handlePreview,
            // onChange: this.handleChange,
          }
          uploadButton = (<div>
            <PlusCircleOutlined/>
            <div className="ant-upload-text">Upload..</div>
          </div>)
        }

        const props = {
          action: '/filesuploader/changeActionToChangeThis',
        }

        return <React.Fragment>
          <Upload {...props}
                  {...listTypeProps}
                  maxCount={limit}
                  showUploadList={{
                    showPreviewIcon: true,
                    showRemoveIcon: !updateDisable,
                  }}
                  {...item.props}
                  {...x}>

            {uploadButton}
          </Upload>
          <Modal
            id={key}
            visible={previewVisible}
            title={previewTitle}
            footer={null}
            onCancel={handleCancel}
          >
            <Image alt="example" style={{width: '100%'}} src={previewImage}/>
          </Modal>
        </React.Fragment>

      case 'switch':
        let extra = {
          defaultChecked: !!item.defaultValue,
          size: item.size !== undefined ? item.size : 'small',
        }
        return <Switch {...extra} {...x} onChange={x.item.onChange}/>

      case 'radioGroup':
        if (!x.options) x.options = []
        //if (!x.item.defaultValue) x.item.defaultValue = { 'key': 'Please Select' }

        if (x.mode === 'solid') {
          return <RadioGroup {...item} {...x} options={x.options} onChange={x.item.onChange}/>
        }

        return <RadioGroup {...item} {...x} options={x.options} onChange={x.item.onChange}/>

      case 'textArea':
      case 'textarea':
        return <TextArea {...x} rows={x.rows} {...item} />

      default:
        return <Input {...x}/>
    }
  }

  const {item} = props
  const {type} = item

  return (
    <>
      {section(type)}
    </>
  )

}

const GetAllFormFields = (props) => {

  const {inputSchema, children, apiurl} = props

  return (
    <>

      {inputSchema.fields.map((item) => {

        let rules = []
        if (item.required) {
          rules.push({
            required: true,
            message: item.requiredMessage ? item.requiredMessage : 'This is a Mandatory Field',
          })
        }

        if (item.label === undefined) {
          item.label = S(item.key).humanize().titleCase().s
        }

        let formItemOptions = {}

        let customEvent = {}
        if (item.customDirectives) {
          customEvent = item.customDirectives
        }

        let inputProps = {}

        if (!!item.placeholder) inputProps.placeholder = item.placeholder
        if (!!apiurl) inputProps.apiurl = apiurl

        if (!!item.options) {
          inputProps.options = item.options
        } else {
          inputProps.options = ['Choose']
        }

        if (!!item.type) inputProps.type = item.type
        if (!!item.mode) inputProps.mode = item.mode
        if (!!item.rows) inputProps.rows = item.rows
        if (!!item.keyAccessor) inputProps.keyAccessor = item.keyAccessor
        if (!!item.valueAccessor) inputProps.valueAccessor = item.valueAccessor

        if (item.type === 'customNumber') {
          customEvent = {
            ...customEvent,
            defaultValue: item.defaultValue ? item.defaultValue : '',
            valuePropName: 'value',
          }
        }

        const normFile = (e, name) => {
          console.log(e, name)
          if (Array.isArray(e)) {
            return e
          }
          let fileUploads = this.state.fileUploads
          fileUploads[name] = e.fileList
          this.setState({fileUploads})
          return e && e.fileList
        }

        if (item.type === 'file') {
          formItemOptions = {
            ...formItemOptions,
            valuePropName: 'fileList',
            getValueFromEvent: (e) => {
              // console.log(e)
              return e.fileList
            },
          }
        }

        if (item.type === 'switch') {
          customEvent = {
            ...customEvent,
            valuePropName: 'checked',
          }
        }

        inputProps = {
          ...inputProps,
          ...item.customProps,
        }

        if (item.type === 'select') {

          if (!inputProps.options) inputProps.options = []
          if (!item.defaultValue) item.defaultValue = {'key': 'Please Select'}

          if (!item.showSearch) item.showSearch = false
          if (!item.disabled) item.disabled = false
          let options = item.options || []

          let keyAccessor = inputProps.keyAccessor ? inputProps.keyAccessor : val => val.id ? val.id : val._id
          let valueAccessor = inputProps.valueAccessor ? inputProps.valueAccessor : val => val.display

          return <Form.Item
            key={item.key}
            name={item.key}
            label={item.label}
            rules={rules}
          >

            <Select
              placeholder={item.placeholder ? item.placeholder : `${item.label}`}
              showSearch={item.showSearch}
              onChange={item.onChange}
              disabled={item.disabled}
              filterOption={(input, option) => {
                let x = option.value
                if (!option.value) {
                  return false
                }
                if (!input) {
                  return false
                }
                return option.value.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }}
              mode={item.mode}
            >
              {options.map((val, index) => {
                if (typeof val === 'object') {
                  return (
                    <Option key={index} value={keyAccessor(val)}>{valueAccessor(val)}</Option>
                  )
                } else {
                  return (
                    <Option key={index} value={val}>{val}</Option>
                  )
                }

              })}
            </Select>

          </Form.Item>

        }

        return (
          <React.Fragment key={item.key}>

            {!item.hidden &&
            <Form.Item
              name={item.key}
              label={item.label}
              rules={rules}
              {...formItemOptions}
            >
              <SimpleFormElement item={item} {...inputProps}/>

              {item.rightComp ? item.rightComp : null}

            </Form.Item>}

          </React.Fragment>
        )

      })}

      {children}

    </>
  )
}

export default (GetAllFormFields)
