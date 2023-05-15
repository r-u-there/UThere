import React from 'react';

function TermsConditionsPopup(props) {
	function insidePopup() {
		return (
			<div>
				<div className="popup-terms">
					<div className="popup-terms-inner">
						<br></br>
							<center><h3>Terms and Conditions</h3></center>
							<ul>
								<li>
									<b>Application Use</b>
									<ul>
										<li>
											1.1. UThere provides video-conferencing services that include the analysis of the videos of meeting participants to generate an average attention score and emotion status.
										</li>
										<li>
											1.2. The analysis of videos is performed solely for the purpose of providing users with insights regarding attention levels and emotional states during video conferences. UThere does not guarantee the accuracy or reliability of these analyses, and the results should be interpreted as general indicators rather than definitive measurements.
										</li>
										<li>
											1.3. Users must have appropriate permissions and consents from participants before utilizing UThere in any video conference. It is the user's responsibility to comply with all applicable privacy laws and regulations regarding the collection and processing of personal data.
										</li>
									</ul>
								</li>
								<li>
									<b>Privacy and Data Security</b>
									<ul>
										<li>
											2.1. UThere collects and processes videos and related data solely for the purpose of analyzing attention levels and emotional states during video conferences. The video data is not stored.
										</li>
										<li>
											2.2. We prioritize the privacy and confidentiality of user data. However, due to the nature of internet-based services, we cannot guarantee the absolute security of data transmitted over the internet. Users acknowledge and accept this inherent risk when using UThere.
										</li>
									</ul>
								</li>
								<li>
									<b>User Responsibilities</b>
									<ul>
										<li>
											3.1. Users are solely responsible for their actions and use of UThere.
										</li>
										<li>
											3.2. Users must not use UThere for any unlawful, malicious, or unethical purposes, including but not limited to infringing on the privacy or rights of other individuals, engaging in harassment or discrimination, or violating any applicable laws or regulations.
										</li>
									</ul>
								</li>
								<li>
								<b>Intellectual Property</b>
									<ul>
										<li>
											4.1. UThere and all associated intellectual property rights are owned by or licensed to us. Users may not modify, distribute, reproduce, or create derivative works based on UThere or its content without prior written consent.
										</li>
									</ul>
								</li>
								<li>
								<b>Limitation of Liability</b>
									<ul>
										<li>
											5.1. To the extent permitted by applicable law, we shall not be liable for any indirect, incidental, consequential, or punitive damages arising out of or in connection with the use or inability to use UThere, including any loss of data, profits, or business opportunities.
										</li>
									</ul>
								</li>
								<li>
								<b>Modifications and Termination</b>
									<ul>
										<li>
											6.1. We reserve the right to modify, suspend, or terminate UThere or these terms at any time, without prior notice or liability.
										</li>
									</ul>
								</li>
								<li>
								<b>Governing Law</b>
									<ul>
										<li>
											7.1. These terms shall be governed by and construed in accordance with the laws of jurisdiction. Any disputes arising under or in connection with these terms shall be subject to the exclusive jurisdiction of the courts of jurisdiction.
										</li>
									</ul>
								</li>
								<li>
									<b>Contact Us</b>
									<ul>
										<li>
											8.1. If you have any questions or concerns regarding these terms, please contact us at info.uthere@gmail.com.
										</li>
									</ul>
								</li>
							</ul>
							<center><button type="button" className="btn btn-danger" onClick={() => props.setTrigger(false)}>OK</button></center>
					</div>
				</div>
			</div>
		)
	}
	return (
		<div>
			{props.trigger === true ? insidePopup() : null}
		</div>
	);
}

export default TermsConditionsPopup;