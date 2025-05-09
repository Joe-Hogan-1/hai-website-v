// Form submission service worker
self.addEventListener("install", (event) => {
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim())
})

// Listen for form submission requests
self.addEventListener("fetch", (event) => {
  // Check if this is a Formspree submission
  if (event.request.url.includes("formspree.io") && event.request.method === "POST") {
    // Clone the request to use it in the fetch call
    const requestClone = event.request.clone()

    // Try to send the form data
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          return response
        })
        .catch((err) => {
          // If fetch fails, store the form data for later
          return requestClone.formData().then((formData) => {
            // Convert FormData to an object
            const formDataObj = {}
            for (const [key, value] of formData.entries()) {
              formDataObj[key] = value
            }

            // Get existing offline submissions
            return caches
              .open("form-submissions")
              .then((cache) => {
                // Store the submission with timestamp
                const submission = {
                  url: event.request.url,
                  method: event.request.method,
                  headers: Array.from(event.request.headers.entries()),
                  formData: formDataObj,
                  timestamp: Date.now(),
                }

                // Store in IndexedDB or cache
                return cache.put(
                  new Request(`offline-submission-${Date.now()}`),
                  new Response(JSON.stringify(submission)),
                )
              })
              .then(() => {
                // Return a success response to the client
                return new Response(
                  JSON.stringify({
                    success: true,
                    offline: true,
                    message: "Your form has been saved and will be submitted when you are back online.",
                  }),
                  {
                    headers: { "Content-Type": "application/json" },
                  },
                )
              })
          })
        }),
    )
  }
})

// Listen for online status changes
self.addEventListener("sync", (event) => {
  if (event.tag === "form-sync") {
    event.waitUntil(syncForms())
  }
})

// Function to sync stored forms
async function syncForms() {
  try {
    const cache = await caches.open("form-submissions")
    const requests = await cache.keys()

    for (const request of requests) {
      if (request.url.includes("offline-submission")) {
        try {
          const response = await cache.match(request)
          if (!response) {
            console.warn("No response found for request:", request.url)
            continue
          }

          let submission
          try {
            submission = await response.json()
          } catch (jsonError) {
            console.error("Error parsing JSON from cache:", jsonError, "Request URL:", request.url)
            await cache.delete(request) // Delete unparseable entry
            continue
          }

          // Create a new FormData object
          const formData = new FormData()
          for (const [key, value] of Object.entries(submission.formData)) {
            formData.append(key, value)
          }

          // Try to submit the form
          try {
            const headers = new Headers()
            submission.headers.forEach(([key, value]) => {
              headers.append(key, value)
            })

            await fetch(submission.url, {
              method: submission.method,
              body: formData,
              headers,
            })

            // If successful, remove from cache
            await cache.delete(request)
          } catch (error) {
            // If still offline, keep in cache
            console.error("Failed to sync form:", error)
          }
        } catch (innerError) {
          console.error("Error processing request:", request.url, innerError)
        }
      }
    }
  } catch (outerError) {
    console.error("Error in syncForms:", outerError)
  }
}
