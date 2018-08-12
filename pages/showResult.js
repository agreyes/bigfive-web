import { Component, Fragment } from 'react'
import calculateScore from 'b5-calculate-score'
import getResult from '@alheimsins/b5-result-text'
import axios from 'axios'
import { Code } from '../components/alheimsins'
import getConfig from 'next/config'
import Summary from '../components/Summary'
import Domain from '../components/Domain'
import SocialShare from '../components/SocialShare'
import validMongoId from '../lib/valid-mongoid'
import formatId from '../lib/format-id'
const { publicRuntimeConfig: { URL } } = getConfig()

const httpInstance = axios.create({
  baseURL: URL,
  timeout: 8000
})



export default class extends Component {
  constructor (props) {
    super(props)
    this.state = {
      chartWidth: 600
    }
    this.getWidth = this.getWidth.bind(this)
  }

  componentDidMount () {
    window.addEventListener('resize', this.getWidth)
    
    this.getWidth()
  }

  componentWillUnmount () {
    window.removeEventListener('resize', this.getWidth)
  }

  getWidth () {
    const chartWidth = window.innerWidth * 0.85
    this.setState({ chartWidth })
  }

  render () {
    const { results, chartWidth } = this.state

    return (
      <Fragment>
        <h2>Result</h2>
        {
          results &&
          <Fragment>
            <Resume data={results} chartWidth={chartWidth} />
          </Fragment>
        }
      </Fragment>
    )
  }
}

const Resume = ({ data, chartWidth }) => (
  <div>
    {data && <div className='domains'><Summary data={data} vAxis={{minValue: 0, maxValue: 120}} chartWidth={chartWidth} /></div>}
    {data && data.map((domain, index) => <Domain data={domain} key={index} chartWidth={chartWidth} />)}
    <style jsx>
      {`
        .domains {
          box-shadow: 0 2px 2px 0 rgba(0,0,0,.16), 0 0 2px 0 rgba(0,0,0,.12);
          margin-top: 10px;
          padding: 10px;
          text-align: left;
        }
      `}
    </style>
  </div>
)
