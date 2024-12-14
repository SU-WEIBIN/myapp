import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, Space, Upload, message, Row, Col, Card, Spin } from 'antd';
import { UserOutlined, LockOutlined, UploadOutlined } from '@ant-design/icons';
// import { getLoginUserUsingGet, userLoginUsingPost } from '@/services/yupi/userController';
import { addChartUsingPost, genChartByAiUsingPost, listChartByPageUsingPost } from '@/services/yupi/chartController';
import { Helmet } from '@umijs/max';
import { createStyles } from 'antd-style';
import TextArea from 'antd/es/input/TextArea';
import ReactECharts from 'echarts-for-react';
/**
 * 添加图表页面
 * @returns 
 */
const AddChart: React.FC = () => {

    const [chart, setChart] = useState<API.BIRespones>();
    const [option, setOption] = useState<any>();
    const [submitting, setSubmitting] = useState<boolean>(false)
   
    /**
     * 提交数据 进行ai分析
     * @param values 
     */
    const onFinish = async (values: any) => {
        // console.log('表单内容 ', values);
        // 对接后端接口,把数据传到后端

        const params = {
            ...values,
            file: undefined
        }
        if (submitting) {
            return;
        }
        setSubmitting(true)//每次点击提交要清空现有的分析数据
        setOption(undefined)
        setChart(undefined)
        try {
            const res = await genChartByAiUsingPost(params, {}, values.file.file.originFileObj);
            console.log(res)
            if (!res?.data) {
                
                message.error("分析失败")
                console.log(res)
            } else {

                const chartOption = JSON.parse(res.data.genChart ?? '')
                if (!chartOption) {
                    throw new Error("图表代码解析错误")
                } else {
                    setChart(res.data)
                    setOption(chartOption)
                    message.success("分析成功")
                }

            }
        } catch (a: any) {
            message.error("分析失败1", a.message)
            // console.log(a.message)
        }
        setSubmitting(false)
    };

    return (
        <div className='add_chart'>
            <Row gutter={24}>
                <Col span={12}>
                    <Card title="智能分析">
                        <Form
                            name="addChart"
                            labelAlign='left'
                            labelCol={{span: 4}} 
                            wrapperCol={{span:16}}
                            onFinish={onFinish}
                            initialValues={{}} // 初始化数据
                        >
                            <Form.Item label="Plain Text">
                                <span className="ant-form-text">China</span>
                            </Form.Item>

                            {/* name 对应后端对象的 字段 所以要命名一致 */}
                            <Form.Item name="goal" label="分析目标" rules={[{ required: true, message: '请输入分析目标' }]}>
                                <TextArea placeholder='请输入分析需求' />
                            </Form.Item>
                            <Form.Item name="name" label="图表名称">
                                <TextArea placeholder='请输入你的图表名称' />
                            </Form.Item>
                            <Form.Item
                                name="chartType"
                                label="图表类型"
                                rules={[{ required: true, message: 'Please select your country!' }]}
                            >
                                <Select options={[
                                    { value: '折线图', label: '折线图' },
                                    { value: '柱状图', label: '柱状图' },
                                    { value: '饼状图', label: '饼状图' },
                                    { value: '雷达图', label: '雷达图' },
                                    { value: '热力图', label: '热力图' },
                                ]} />

                            </Form.Item>
                            {/* 文件 */}
                            <Form.Item
                                name="file"
                                label="原始数据"
                            >
                                {/* action 这里是指要调用的接口 */}
                                <Upload name="file" maxCount={1}>
                                    <Button icon={<UploadOutlined />}>上传表格数据文件</Button>
                                </Upload>
                            </Form.Item> 

                            <Form.Item wrapperCol={{ span: 16, offset: 4 }}>
                                <Space>
                                    <Button type="primary" htmlType="submit" loading={submitting} disabled={submitting}>
                                        智能分析
                                    </Button>
                                    <Button htmlType="reset">重置</Button>
                                </Space>
                            </Form.Item>
                        </Form>
                    </Card>
                </Col>
                <Col span={12}>
                    <Card title={"分析结论"}>
                        {chart?.genResult ?? <div>请先在左侧提交</div>}
                        <Spin spinning={submitting}/>

                    </Card>
                    <Card title="可视化图表" loading={submitting}>
                        {option ? <ReactECharts option={option} />:<div>请先在左侧提交</div>}
                    </Card>

                </Col>
            </Row>


        </div>
    );
};

export default AddChart;