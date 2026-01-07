// import React, { useEffect, useRef, useState } from 'react';

// const Signature = ({ value, onChange, width = 500, height = 200, label }) => {
//   const canvasRef = useRef(null);
//   const containerRef = useRef(null);
//   const [isDrawing, setIsDrawing] = useState(false);
//   const [ctxReady, setCtxReady] = useState(false);

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;
//     canvas.width = width;
//     canvas.height = height;
//     const ctx = canvas.getContext('2d');
//     ctx.lineCap = 'round';
//     ctx.lineJoin = 'round';
//     ctx.lineWidth = 2.5;
//     ctx.strokeStyle = '#000';
//     setCtxReady(true);
//     if (value) {
//       loadImageToCanvas(value);
//     } else {
//       ctx.clearRect(0, 0, canvas.width, canvas.height);
//     }
//   }, [canvasRef]);

//   useEffect(() => {
//     if (!value || !canvasRef.current) return;
//     loadImageToCanvas(value);
//   }, [value]);

//   const loadImageToCanvas = (dataUrl) => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;
//     const ctx = canvas.getContext('2d');
//     const img = new Image();
//     img.onload = () => {
//       ctx.clearRect(0, 0, canvas.width, canvas.height);
//       const ratio = Math.min(canvas.width / img.width, canvas.height / img.height);
//       const w = img.width * ratio;
//       const h = img.height * ratio;
//       const x = (canvas.width - w) / 2;
//       const y = (canvas.height - h) / 2;
//       ctx.drawImage(img, x, y, w, h);
//       emitChange();
//     };
//     img.src = dataUrl;
//   };

//   const getPointerPos = (e) => {
//     const rect = canvasRef.current.getBoundingClientRect();
//     const x = e.clientX - rect.left;
//     const y = e.clientY - rect.top;
//     return { x, y };
//   };

//   const handlePointerDown = (e) => {
//     if (!ctxReady) return;
//     setIsDrawing(true);
//     const ctx = canvasRef.current.getContext('2d');
//     const pos = getPointerPos(e);
//     ctx.beginPath();
//     ctx.moveTo(pos.x, pos.y);
//   };

//   const handlePointerMove = (e) => {
//     if (!isDrawing) return;
//     const ctx = canvasRef.current.getContext('2d');
//     const pos = getPointerPos(e);
//     ctx.lineTo(pos.x, pos.y);
//     ctx.stroke();
//   };

//   const handlePointerUp = () => {
//     if (!isDrawing) return;
//     setIsDrawing(false);
//     const ctx = canvasRef.current.getContext('2d');
//     ctx.closePath();
//     emitChange();
//   };

//   const emitChange = () => {
//     if (!canvasRef.current) return;
//     try {
//       const data = canvasRef.current.toDataURL('image/png');
//       if (onChange) onChange(data);
//     } catch (err) {
//       // ignore
//     }
//   };

//   const handleClear = () => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;
//     const ctx = canvas.getContext('2d');
//     ctx.clearRect(0, 0, canvas.width, canvas.height);
//     if (onChange) onChange('');
//   };

//   const handleUpload = (e) => {
//     const f = e.target.files && e.target.files[0];
//     if (!f) return;
//     const reader = new FileReader();
//     reader.onload = (ev) => {
//       const dataUrl = ev.target.result;
//       loadImageToCanvas(dataUrl);
//       if (onChange) onChange(dataUrl);
//     };
//     reader.readAsDataURL(f);
//   };

//   return (
//     <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
//       {label && <label style={{ fontSize: 14, marginBottom: 4 }}>{label}</label>}
//       <div style={{ border: '1px solid #ccc', display: 'inline-block' }}>
//         <canvas
//           ref={canvasRef}
//           style={{ touchAction: 'none', background: 'transparent', display: 'block' }}
//           onPointerDown={handlePointerDown}
//           onPointerMove={handlePointerMove}
//           onPointerUp={handlePointerUp}
//           onPointerLeave={handlePointerUp}
//         />
//       </div>
//       <div style={{ display: 'flex', gap: 8 }}>
//         <button type="button" onClick={handleClear}>Clear</button>
//         <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
//           <input type="file" accept="image/*" onChange={handleUpload} style={{ display: 'none' }} />
//           <span>Upload</span>
//         </label>
//       </div>
//     </div>
//   );
// };

// export default Signature;

import React, { useRef, useEffect } from 'react';

const Signature = ({ value, onChange, label }) => {
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = 500;
    canvas.height = 200;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#000';

    // Load existing signature (URL or base64)
    if (value) {
      loadImage(value);
    } else {
      clearCanvas();
    }
  }, []);

  // Reload when value changes (edit mode)
  useEffect(() => {
    if (value) {
      loadImage(value);
    } else {
      clearCanvas();
    }
  }, [value]);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const loadImage = (src) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const img = new Image();

    // Critical: Set crossOrigin to avoid tainting
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      clearCanvas();
      const scale = Math.min(canvas.width / img.width, canvas.height / img.height, 1);
      const w = img.width * scale;
      const h = img.height * scale;
      const x = (canvas.width - w) / 2;
      const y = (canvas.height - h) / 2;
      ctx.drawImage(img, x, y, w, h);
    };

    img.onerror = () => {
      console.warn('Could not load signature image (CORS or invalid URL)');
      clearCanvas();
    };

    img.src = src;
  };

  const getPos = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || e.touches?.[0]?.clientX;
    const clientY = e.clientY || e.touches?.[0]?.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (e) => {
    isDrawing.current = true;
    const ctx = canvasRef.current.getContext('2d');
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const draw = (e) => {
    if (!isDrawing.current) return;
    const ctx = canvasRef.current.getContext('2d');
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    saveSignature();
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas || !onChange) return;

    try {
      const dataUrl = canvas.toDataURL('image/png');
      // Check if canvas is actually empty
      const isEmpty = dataUrl === 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...' || // default empty
                      dataUrl.length < 1000; // very small = likely blank

      onChange(isEmpty ? '' : dataUrl);
    } catch (err) {
      console.warn('Canvas tainted - cannot save. User must draw/upload new signature.');
      // Do nothing - keep old value (S3 URL) if canvas is tainted
    }
  };

  const handleClear = () => {
    clearCanvas();
    onChange('');
  };

  const handleUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      loadImage(ev.target.result);
      // Save after a short delay to ensure image is drawn
      setTimeout(saveSignature, 200);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {label && <div style={{ fontWeight: 500, fontSize: 16 }}>{label}</div>}

      <div
        style={{
          border: '2px dashed #ccc',
          borderRadius: '10px',
          padding: '15px',
          backgroundColor: '#f9f9f9',
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            backgroundColor: 'white',
            border: '1px solid #999',
            borderRadius: '8px',
            width: '30%',
            height: '200px',
            display: 'block',
            touchAction: 'none',
          }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-start' }}>
        <button
          type="button"
          onClick={handleClear}
          style={{
            padding: '10px 20px',
            backgroundColor: '#e74c3c',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          Clear
        </button>

        <label
          style={{
            padding: '10px 20px',
            backgroundColor: '#3498db',
            color: 'white',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          Upload Image
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            style={{ display: 'none' }}
          />
        </label>
      </div>
    </div>
  );
};

export default Signature;
// import React, { useRef, useEffect } from 'react';
// import SignatureCanvas from 'react-signature-canvas';

// const Signature = ({ value, onChange, label }) => {
//   const sigRef = useRef();

//   // Load existing signature (S3 URL or base64) - only for display
//   useEffect(() => {
//     const pad = sigRef.current;
//     if (!pad || !value) {
//       pad?.clear();
//       return;
//     }

//     // Clear first to avoid overlap
//     pad.clear();

//     // Load the image for display only
//     pad.fromDataURL(value);
//   }, [value]);

//   const handleEnd = () => {
//     const pad = sigRef.current;
//     if (!pad || !onChange) return;

//     if (pad.isEmpty()) {
//       onChange('');
//     } else {
//       try {
//         // This will work ONLY if canvas is NOT tainted (i.e., user drew/uploaded locally)
//         const dataUrl = pad.toDataURL('image/png');
//         onChange(dataUrl);
//       } catch (err) {
//         // If tainted (from remote load), keep the original value (URL)
//         // User can still clear or draw new (which will un-taint)
//         console.warn('Canvas tainted - keeping original signature URL');
//       }
//     }
//   };

//   const handleClear = () => {
//     const pad = sigRef.current;
//     if (pad) {
//       pad.clear();
//       onChange('');
//     }
//   };

//   const handleUpload = (e) => {
//     const file = e.target.files?.[0];
//     if (!file || !file.type.startsWith('image/')) {
//       alert('Please select a valid image');
//       return;
//     }

//     const reader = new FileReader();
//     reader.onload = (ev) => {
//       const dataUrl = ev.target?.result;
//       const pad = sigRef.current;
//       if (pad && dataUrl) {
//         pad.clear(); // Clear old remote image to avoid taint
//         pad.fromDataURL(dataUrl);
//         setTimeout(handleEnd, 100);
//       }
//     };
//     reader.readAsDataURL(file);
//   };

//   return (
//     <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
//       {label && <div style={{ fontWeight: '500', fontSize: 14 }}>{label}</div>}

//       <div
//         style={{
//           border: '2px dashed #ccc',
//           borderRadius: '8px',
//           padding: '12px',
//           backgroundColor: '#fafafa',
//         }}
//       >
//         <SignatureCanvas
//           ref={sigRef}
//           penColor="black"
//           onEnd={handleEnd}
//           canvasProps={{
//             style: {
//               backgroundColor: 'white',
//               border: '1px solid #aaa',
//               borderRadius: '6px',
//               width: '100%',
//               height: '200px',
//               display: 'block',
//             },
//           }}
//         />
//       </div>

//       <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
//         <button
//           type="button"
//           onClick={handleClear}
//           style={{
//             padding: '10px 20px',
//             backgroundColor: '#f44336',
//             color: 'white',
//             border: 'none',
//             borderRadius: '6px',
//             cursor: 'pointer',
//           }}
//         >
//           Clear
//         </button>

//         <label
//           style={{
//             padding: '10px 20px',
//             backgroundColor: '#1976d2',
//             color: 'white',
//             borderRadius: '6px',
//             cursor: 'pointer',
//           }}
//         >
//           Upload Image
//           <input
//             type="file"
//             accept="image/*"
//             onChange={handleUpload}
//             style={{ display: 'none' }}
//           />
//         </label>
//       </div>
//     </div>
//   );
// };

// export default Signature;