'use strict'

const config = require('config')

const commonTemplate = (configObj) => {
  return `<body>
    <div class="template-main-container" style="max-width: 500px; background-color: #fff; padding: 40px; border-radius: 4px;">
        <table style="width: 100%;">
          <tbody>
            <tr>
              <td>
              <tr><td><img src="${config.constants.S3_BASE_URL}/email-template-images/new_bg_logo2.jpg" style="max-width: 171px;"/></td></tr>
              </td>
            </tr>
            <tr>
              <td>
                <table>
                  <tbody>
                    <tr>
                      <td style="height: 40px;"></td>
                    </tr>
                    <tr>
                      <td><h1 style="color: #1d2026; font-size: 24px; font-weight: 700; font-family: 'Roboto', sans-serif;"> ${configObj.header}</h1></td>
                    </tr>
                    <tr>
                      <td style="height: 10px;"></td>
                    </tr>
                    <tr>
                      <td style="color: #1d2026; font-size: 16px; font-family: 'Roboto', sans-serif;">${configObj.message}</td>
                    </tr>
                    <tr>
                      <td style="height: 50px;"></td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
            ${configObj.finalSection}
            <tr>
              <td style="height: 40px"></td>
            </tr>
            <tr>
              <td>
                <table style="width: 100%;">
                  <tbody>
                    <tr>
                      <td>
                        <h2 style="color: #1d2026; font-size: 20px; font-weight: 700; font-family: 'Roboto', sans-serif; padding: 12px 0px; margin: 0px; border-bottom: 1px solid #e6ecf0;">Additional Resources</h2>
                      </td>
                    </tr>
                    <tr>
                      <td style="height: 10px"></td>
                    </tr>
                    <tr>
                      <td style="color: #1d2026; font-size: 16px; font-family: 'Roboto', sans-serif;">Stay current with the newest updates from Virtuous AI for developers, mangers, and regulators.</td>
                    </tr>
                    <tr>
                      <td style="padding: 15px 0px;"><a href="https://www.virtuousai.com/#cta-2" style="text-decoration: none; padding: 10px 20px; background-color: #1d2026; border-radius: 36px; color: #fff; font-size: 16px; font-family: 'Roboto', sans-serif; display: flex; align-items: center; justify-content: center; width: fit-content;">Learn More</a></td>
                    </tr>
                    <tr>
                      <td style="height: 40px"></td>
                    </tr>
                    <tr>
                      <td style="color: #1d2026; font-size: 16px; font-family: 'Roboto', sans-serif;">Best Regards,</td>
                    </tr>
                    <tr>
                      <td style="height: 5px"></td>
                    </tr>
                    <tr>
                      <td style="color: #1d2026; font-size: 16px; font-family: 'Roboto', sans-serif;">Virtuous AI</td>
                    </tr>
                    <tr>
                      <td style="height: 50px; border-bottom: 1px solid #e6ecf0;"></td>
                    </tr>
                    <tr>
                      <td>
                          <table style="width: 100%;">
                              <tbody>
                                  <tr>
                                      <td style="padding: 15px 0px;">
                                      <a href="https://twitter.com/virtuousai" target="_blank">
                                      <img src="${config.constants.S3_BASE_URL}/email-template-images/new_twitter.png" style="max-width: 18px; margin-right: 28px;"/>
                                      </a>
                                      <a href="https://www.facebook.com/VirtuousAIOfficial" target="_blank">
                                          <img src="${config.constants.S3_BASE_URL}/email-template-images/new_fb.png" style="max-width: 18px; margin-right: 28px;"/>
                                      </a>                                        
                                      <a href="https://www.linkedin.com/company/virtuousai" target="_blank">
                                          <img src="${config.constants.S3_BASE_URL}/email-template-images/new_linkdin.png" style="max-width: 18px; margin-right: 28px;"/>
                                      </a>
                                      </td>
                                  </tr>
                              </tbody>
                          </table>
                      </td>
                  </tr>
                  <tr>
                  <td><img src="${config.constants.S3_BASE_URL}/email-template-images/new_bg_logo2.jpg" style="max-width: 171px;"/></td>
                  </tr>
                  <tr>
                    <td style="color: #1d2026; font-size: 12px; font-family: 'Roboto', sans-serif;">Copyright © ${new Date().getFullYear()} VirtuousAI</td>
                  </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
    </div>
</body>  `
}

const linkStyle = `font-weight: 500; font-size: 16px; text-decoration: underline; color: #0079CF; cursor: pointer;`

module.exports = {
  commonTemplate,
  linkStyle
}
