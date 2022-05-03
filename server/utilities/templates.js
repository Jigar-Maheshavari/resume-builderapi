'use strict'

const config = require('config')

const commonTemplate = configObj => {
    return `
    <body>
    <div class="main-container" style="max-width: 640px; width: 100%; background-color: #fff; height: 100%; min-height: 500px; padding: 32px;">
        <div class="inner-container" style="width: 100%; padding: 32px;">
            <table style="width: 100%;">
                <tbody>
                    <tr>
                        <td>
                            <table>
                                <tbody>
                                    <tr><td><img src="${config.constants.S3_BASE_URL}/email-template-images/new_bg_logo2.jpg" style="max-width: 171px;"/></td></tr>
                                </tbody>
                            </table>
                        </td>
                    </tr>
                    <tr><td style="height: 24px;"></td></tr>
                    <tr><td style="height: 16px;"></td></tr>
                    <tr>
                        <td>
                            <table>
                                <tbody>
                                    <tr><td style="font-weight: 700; font-size: 24px;">${configObj.title}</td></tr>
                                </tbody>
                            </table>
                        </td>
                    </tr>
                    <tr><td style="height: 16px;"></td></tr>
                    <tr>
                        <td>
                            <table>
                                <tbody>
                                    <tr>
                                        <td style="font-weight: 400; font-size: 16px;">
                                        ${configObj.message}
                                        </td>
                                        <!-- <td style="font-weight: 400; font-size: 16px;">The purpose of these resources is to acquaint you with the tools and resources that Virtuous AI provides developers, 
                                            managers, and auditors to create AI that is trustworthy: this includes Responsibly built, Equitable, Governable, Reliable, 
                                            and Traceable (#noREGRet). <a style="font-weight: 500; font-size: 16px; text-decoration: underline; color: #0079CF; cursor: pointer;">Learn more</a>
                                        </td> -->
                                    </tr>
                                </tbody>
                            </table>
                        </td>
                    </tr>
                    <tr><td style="height: 16px;"></td></tr>
                    <tr><td style="height: 16px;"></td></tr>
                    <tr>
                        <td>
                            <table>
                                <tbody>
                                    <tr>
                                        <td style="font-weight: 400; font-size: 16px;">
                                            Best Regards,
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </td>
                    </tr>
                    <tr><td style="height: 16px;"></td></tr>
                    <tr>
                        <td>
                            <table>
                                <tbody>
                                    <tr>
                                        <td style="font-weight: 400; font-size: 16px;">
                                            Virtuous AI
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </td>
                    </tr>
                    <tr><td style="height: 32px;"></td></tr>
                    <tr><td style="height: 1px; background-color: rgba(0, 0, 0, 0.24);"></td></tr>
                    <tr><td style="height: 27px;"></td></tr>
                    <tr>
                        <td>
                            <table>
                                <tbody>
                                    <tr>
                                        <td>
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
                    <tr><td style="height: 27px;"></td></tr>
                    <tr>
                        <td>
                            <table>
                                <tbody>
                                    <tr>
                                        <td><img src="${config.constants.S3_BASE_URL}/email-template-images/icon.png" style="max-width: 52px;"/></td>
                                    </tr>
                                </tbody>
                            </table>
                        </td>
                    </tr>
                    <tr><td style="height: 5px;"></td></tr>
                    <tr>
                        <td>
                            <table>
                                <tbody>
                                    <tr>
                                        <td style="font-weight: 400; font-size: 12px;">
                                            Copyright © ${new Date().getFullYear()} VirtuousAI
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</body>
    `
}

const linkStyle = `font-weight: 500; font-size: 16px; text-decoration: underline; color: #0079CF; cursor: pointer;`

module.exports = {
    commonTemplate,
    linkStyle
}
