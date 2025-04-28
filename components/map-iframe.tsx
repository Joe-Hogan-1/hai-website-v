import type React from "react"

const MapIframe: React.FC = () => (
  <iframe
    src="https://experience.arcgis.com/experience/f26c9264d6f6473ca8dff70f238b7756/?org=nysocm"
    width="100%"
    height="100%"
    frameBorder="0"
    style={{ border: 0 }}
    allowFullScreen
    title="New York State Licensed Cannabis Dispensaries"
    loading="lazy"
  />
)

export default MapIframe
