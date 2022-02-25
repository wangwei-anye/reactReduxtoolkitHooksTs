import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Form, Input, Button, Checkbox } from 'antd';
import { login } from '@/services/login';
import './index.less';

const Login = () => {
  const onFinish = async (values) => {
    const { data } = await login({
      username: values.username,
      password: values.password
    });
    if (data.code === 200) {
      window.location.href = '/case-lib';
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };

  return (
    <div className='login-wrap'>
      <div className='title'>欢迎使用</div>
      <Form
        name='basic'
        labelCol={{
          span: 8
        }}
        wrapperCol={{
          span: 16
        }}
        initialValues={{
          remember: true
        }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete='off'
      >
        <Form.Item
          label='用户名'
          name='username'
          rules={[
            {
              required: true,
              message: 'Please input your username!'
            }
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label='密码'
          name='password'
          rules={[
            {
              required: true,
              message: 'Please input your password!'
            }
          ]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          name='remember'
          valuePropName='checked'
          wrapperCol={{
            offset: 8,
            span: 16
          }}
        >
          <Checkbox>记住</Checkbox>
        </Form.Item>

        <Form.Item
          wrapperCol={{
            offset: 8,
            span: 16
          }}
        >
          <Button type='primary' htmlType='submit'>
            登入
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Login;
