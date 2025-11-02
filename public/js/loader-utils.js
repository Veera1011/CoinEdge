// Global SweetAlert2 Loader Utility
class SweetLoader {
    static showLoader(title = 'Loading...', text = 'Please wait') {
        Swal.fire({
            title: title,
            text: text,
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false,
            didOpen: () => {
                Swal.showLoading();
            },
            customClass: {
                popup: 'swal-loader-popup'
            }
        });
    }

    static hideLoader() {
        Swal.close();
    }

    static showSuccess(title, text) {
        Swal.fire({
            icon: 'success',
            title: title,
            text: text,
            confirmButtonText: 'OK',
            customClass: {
                popup: 'swal-success-popup',
                confirmButton: 'swal-confirm-btn'
            }
        });
    }

    static showError(title, text) {
        Swal.fire({
            icon: 'error',
            title: title,
            text: text,
            confirmButtonText: 'OK',
            customClass: {
                popup: 'swal-error-popup',
                confirmButton: 'swal-confirm-btn'
            }
        });
    }
}