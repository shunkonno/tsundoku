import React, { useState, useEffect } from 'react'
import { useMediaDevices } from '../../contexts/MediaDeviceProvider'
import Field from '../Field'
import { SelectInput } from '../Input'

export const DeviceSelect = () => {

  const {
    cams,
    mics,
    // speakers,
    currentDevices,
    setCamDevice,
    setMicDevice,
    setSpeakersDevice
  } = useMediaDevices()

  

  if (!currentDevices) {
    return <div className="text-center">
      <p>デバイスを検索中…</p>
      <p className="mt-1">(マイクの使用を許可してください。)</p>
      </div>
  }

  const [devis, setDevis] = useState([])
  const [speakers, setSpeakers] = useState([])
  // var a = []
  // navigator.mediaDevices.enumerateDevices().then(function(devices) {
  //   console.log("devices", devices);
  //   a = devices
  //  });
  
   useEffect(()=>{
    async function getDevices () {
      navigator.mediaDevices.enumerateDevices().then(function(devices) {
          console.log("devices", devices);
          setDevis(devices)

          const [defaultSpeaker, ...speakerDevices] = devices.filter(
            (d) => d.kind === 'audiooutput' && d.deviceId !== ''
          )
          setSpeakers(
            [
              defaultSpeaker,
              ...speakerDevices.sort((a, b) => sortByKey(a, b, 'label', false))
            ].filter(Boolean)
          )
         });
    }
    getDevices()
   },[])

   console.log('devis :', devis)
   console.log('speakers :', speakers)


  return (
    <>
      {/* <Field label="Select camera:">
        <SelectInput
          onChange={(e) => setCamDevice(cams[e.target.value])}
          value={cams.findIndex(
            (i) => i.deviceId === currentDevices.camera.deviceId
          )}
        >
          {cams.map(({ deviceId, label }, i) => (
            <option key={`cam-${deviceId}`} value={i}>
              {label}
            </option>
          ))}
        </SelectInput>
      </Field> */}

      <Field label="マイクを選択">
        <SelectInput
          onChange={(e) => setMicDevice(mics[e.target.value])}
          value={mics.findIndex(
            (i) => i.deviceId === currentDevices.mic.deviceId
          )}
        >
          {mics.map(({ deviceId, label }, i) => (
            <option key={`mic-${deviceId}`} value={i}>
              {label}
            </option>
          ))}
        </SelectInput>
      </Field>

      {/**
       * Note: Safari does not support selection audio output devices
       */}
      {speakers?.length > 0 && (
        <Field label="スピーカーを選択">
          <SelectInput
            onChange={(e) => setSpeakersDevice(speakers[e.target.value])}
            value={speakers.findIndex(
              (i) => i.deviceId === currentDevices.speaker.deviceId
            )}
          >
            {speakers.map(({ deviceId, label }, i) => (
              <option key={`speakers-${deviceId}`} value={i}>
                {label}
              </option>
            ))}
          </SelectInput>
        </Field>
      )}
    </>
  )
}

export default DeviceSelect
